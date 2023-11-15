let title = require("./title.cjs")
let health = require("./health.cjs")
let rolls = require("./rolls.cjs")

module.exports = () => {
  // prettier-ignore
  return [
    title(),
    health(),
    rolls(),
  ]
}
