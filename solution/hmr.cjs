let path = require("node:path")

let chokidar = require("chokidar")
let esbuild = require("esbuild")

module.exports = async (entrypoint, socket) => {
  let invalidate = async (modulePath) => {
    let dependents = await analyze(entrypoint)
    let q = [modulePath]
    while (q.length > 0) {
      let modPath = q.pop()
      delete require.cache[modPath]
      let deps = dependents[modPath] ?? []
      q.push(...deps)
    }
  }

  let appDir = path.join(process.cwd(), "app")
  let watcher = chokidar.watch(appDir, { ignoreInitial: true })
  watcher.on("change", async (file) => {
    await invalidate(file)
    socket.send()
  })

  return () => require(entrypoint)
}

let analyze = async (entrypoint) => {
  let result = await esbuild.build({
    bundle: true,
    entryPoints: [entrypoint],
    metafile: true,
    write: false,
    platform: "node",
    logLevel: "silent",
  })

  let dependents = {}
  for (let [input, meta] of Object.entries(result.metafile.inputs)) {
    for (let imp of meta.imports) {
      let rImpPath = path.resolve(imp.path)
      dependents[rImpPath] = dependents[rImpPath] ?? []
      dependents[rImpPath].push(path.resolve(input))
    }
  }
  return dependents
}
