let { render, run, socket } = require("#lib/browser")
let hmr = require("#hmr")

let main = async () => {
  let s = socket()
  let getApp = await hmr("#app/index", s)
  run(() => {
    let app = getApp()
    return render(app)
  }, s)
}
main()
