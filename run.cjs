let { render, run } = require("#lib/browser")

let app = require("#app/index")
run(() => render(app))
