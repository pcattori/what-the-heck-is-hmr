let { render, run, socket } = require("#lib/browser")
let hmr = require("#hmr")

// cold
// let app = require("#app/index")
// run(() => render(app))

// hot
let main = async () => {
  let s = socket()
  let getApp = await hmr("#app/index", s)
  run(() => {
    let app = getApp()
    return render(app)
  }, s)
}
main()
