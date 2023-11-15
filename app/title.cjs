let { inline, input } = require("#lib/html")

let state = "Lancelot"

/** @param {string} value */
let rename = (value) => {
  state = value
}

module.exports = () => {
  return inline("Name: ", input(state, "n", rename))
}
