---
id: get-render
title: getRender
sidebar_label: getRender
hide_title: true
---

# getRender(wiringTree, options)

#### Arguments
1. [`wiringTree`](wiring-tree.md) (Object) An tree shaped object that describes all of the serializers and interactions needed to test your components
2. `options` (Object) An object of conigurations that will apply to the entirety of the wiring tree

#### Returns
An object of [`findChild`](find-child.md) functions for all children, in addition to an new functions added by [root node extend](wiring-tree.md#the-root-node)

#### Example
```javascript
const wiringTree = {
    ...
}
const options = {
    ...
}
const render = getRender(wiringTree, options)
const {findFirstChild} = render(component)
```

## Options

### `customQueries` (Object)
An object where the key is the name of custom query and the value is a function with the shape of (element, ...args) => foundElement


