// prettier-ignore
let inline = (...items) => ({ type: "inline", items })
let input = (value, key, edit) => ({ type: "input", value, key, edit })
let button = (key, click) => ({ type: "button", key, click })

module.exports = {
  inline,
  input,
  button,
}
