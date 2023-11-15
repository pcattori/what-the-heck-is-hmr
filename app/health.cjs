let { button, inline } = require("#lib/html")

let state = 30

let increment = () => {
  state += 1
}

let decrement = () => {
  state -= 1
}

// prettier-ignore
module.exports = () => {
  return inline(
    "Health: ",
    state,
    " (",
    button("+", increment),
    "/",
    button("-", decrement),
    ")"
  )
}
