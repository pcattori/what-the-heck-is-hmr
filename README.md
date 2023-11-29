# What the heck is HMR?

Learn what Hot Module Replacement is and how it works by reinventing it from scratch!

https://github.com/pcattori/what-the-heck-is-hmr/assets/1477317/acfdcdf9-3130-47d1-85bc-6669c57ba11c

This tutorial focuses on the core concepts of HMR.
So instead of wrestling with the browser and network, we'll keep everything in Node.
To that end, we'll use a simple CLI app meant to mirror a typical web app.

If you get stuck at any point, you can peek at the [solutions](./solution).

## 1 Play with the example app

Start by running the example app:

```sh
node ./run.cjs
```

Interactable elements will be highlighted red.

To change the name of your character, press <kbd>n</kbd>.
A prompt should appear where you can enter in the new name.
Press <kbd>Enter</kbd> to confirm.

To change your health, press <kbd>+</kbd> or <kbd>-</kbd>.

## 2 Add a new component for dice rolls

Open `app/rolls.cjs` and create a new component.
It should let users press <kbd>r</kbd> to roll a random number between 1 and 6.
It should also display the last seven rolls.

## 3 Watch for changes in the app directory

Ok time to start reinventing HMR!

Start by watching the app directory for changes with [chokidar](https://github.com/paulmillr/chokidar).
Whenever file changes are detected, re-require the app.

## 4 Invalidate the whole app

`require` is caching all of the modules in our app, so we get the old app whenever we re-require it.
When changes are detected, invalidate _all_ the modules from the app directory.

## 5 Trigger re-renders on changes

We're re-requiring the app, but nothing is happening.
When changes are detected, let's signal to the browser that it should re-render the app.

Nice! You've reinvented live reload!

## 6 Invalidate only the changed module

The whole point of HMR is to be surgical about picking up code changes so that state is preserved.
Right now, we're invalidating the whole app, so we're losing state all over the place.

When changes are detected, invalidate _only_ the modules that changes in the app directory.
Make sure to also invalidate any direct or indirect dependents of the changed module!
In other words, bubble up the invalidation.

HINT: to determine dependents, you can use [esbuild](https://esbuild.github.io/):

```ts
let esbuild = require("esbuild")

let result = await esbuild.build({
  bundle: true,
  entryPoints: [entrypoint],
  metafile: true,
  write: false,
  platform: "node",
  logLevel: "silent",
})

// you'll need to use the metafile to determine dependents
let dependents = somehowGetDependents(result.metafile)
```

Nice! You've reinvented HMR!

## 7 Put state in its own module

You may have noticed that while most of the app state is preserved, the state for the module we are changing is lost.
That's true even if we only change the UI component and not the state.
For better developer experience, let's move the state into its own module.
That way we can change the UI without losing state.
