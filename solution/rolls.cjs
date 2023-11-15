let { button, inline } = require("#lib/html")

let state = []

let roll = () => {
  let result = Math.floor(Math.random() * 6) + 1
  state.push(result)
  if (state.length > 7) {
    state.shift()
  }
}

module.exports = () => {
  // prettier-ignore
  return [
    inline("Rolls: (", button("r", roll), ")"),
    state.join(", ")
  ];
}
