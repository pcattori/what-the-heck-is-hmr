let fs = require("node:fs")
let path = require("node:path")

let chokidar = require("chokidar")
let dedent = require("dedent")
let esbuild = require("esbuild")

module.exports = async (entrypoint, socket) => {
  let entryPath = path.relative(process.cwd(), require.resolve(entrypoint))

  // analyze
  let analyzed = await analyze(entrypoint)

  // cache + invalidate
  let cache = {}
  let invalidate = (modulePath) => {
    let toInvalidate = [modulePath]
    while (toInvalidate.length > 0) {
      let modPath = toInvalidate.pop()
      cache[modPath] = undefined
      let deps = analyzed.dependents[modPath] ?? []
      toInvalidate.push(...deps)
    }
  }

  // require
  let _require = (modulePath) => {
    let exports = cache[modulePath]
    if (exports !== undefined) {
      return exports
    }

    let code = fs.readFileSync(modulePath, "utf8")
    let wrapped = dedent`
      function (require) {
        let module = { exports: {}}
        ${code}
        return module.exports
      }
    `

    let mod = new Function("return " + wrapped)()

    exports = mod((specifier) => {
      let depPath = analyzed.imports[modulePath][specifier]
      if (depPath === undefined)
        throw Error(
          `Could not resolve import: ${depPath}\n  from ${modulePath}`,
        )
      return _require(depPath)
    })
    cache[modulePath] = exports
    return exports
  }
  let app = _require(entryPath)

  // watch
  let appDir = path.dirname(entryPath)
  let watcher = chokidar.watch(appDir, {
    ignoreInitial: true,
  })
  watcher.on("change", async (file) => {
    analyzed = await analyze(entrypoint)

    let modulePath = path.relative(process.cwd(), file)
    invalidate(modulePath)
    app = _require(entryPath)
    socket.send()
  })

  return () => app
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

  let imports = {}
  let dependents = {}
  for (let [input, meta] of Object.entries(result.metafile.inputs)) {
    imports[input] = {}
    for (let imp of meta.imports) {
      imports[input][imp.original] = imp.path
      dependents[imp.path] = dependents[imp.path] ?? []
      dependents[imp.path].push(input)
    }
  }

  return { imports, dependents }
}

// let debug = (...messages) => {
//   fs.appendFileSync("debug.txt", messages.join(" ") + "\n")
// }
