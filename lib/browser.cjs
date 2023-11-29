let readline = require("node:readline")

let boxen = require("boxen")
let colors = require("picocolors")

let cursor = {
  hide: () => process.stdin.write("\u001B[?25l"),
  show: () => process.stdin.write("\u001B[?25h"),
}

let socket = () => {
  let handlers = []
  return {
    listen: (handler) => handlers.push(handler),
    send: () => handlers.forEach((handler) => handler()),
  }
}

let render = (component) => {
  let handlers = {}

  let recurse = (element) => {
    if (typeof element === "string") return element
    if (typeof element === "number") return element

    if (Array.isArray(element)) return element.map(recurse).join("\n")
    if (element.type === "inline") return element.items.map(recurse).join("")

    if (element.type === "input") {
      handlers[element.key] = element
      return (
        colors.green(recurse(element.value)) + ` (${colors.red(element.key)})`
      )
    }

    if (element.type === "button") {
      handlers[element.key] = element
      return colors.red(recurse(element.key))
    }
  }

  let frame = recurse(component())

  console.clear()
  console.log(
    boxen(frame.trim() + "\n\n" + colors.gray("Press CTRL-C to exit"), {
      padding: 1,
      margin: 1,
      borderStyle: "round",
    }),
  )

  return handlers
}

let run = (render, socket = undefined) => {
  let handlers = render()

  if (socket) {
    socket.listen(() => {
      handlers = render()
    })
  }

  readline.emitKeypressEvents(process.stdin)
  process.stdin.setRawMode(true)
  cursor.hide()
  let input = null

  process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === "c") {
      console.clear()
      cursor.show()
      process.exit()
    }

    if (input) {
      if (key.name === "return") {
        input.edit(input.value)
        handlers = render()
        input = null
        return
      }

      if (key.name === "backspace") {
        input.value = input.value.slice(0, -1)
      } else if (typeof str === "string") {
        input.value += str
      }

      handlers = render()
      process.stdin.write("> " + input.value)
      return
    }

    if (key.name === "return") {
      handlers = render()
    }

    let el = handlers[str]
    if (el === undefined) return
    if (el.type === "button") {
      el.click()
      handlers = render()
    }
    if (el.type === "input") {
      input = { edit: el.edit, value: "" }
      handlers = render()
      process.stdin.write("> ")
    }
  })
}

module.exports = {
  render,
  run,
  socket,
}
