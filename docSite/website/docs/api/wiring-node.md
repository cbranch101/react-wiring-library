---
id: wiring-node
title: Wiring Node
sidebar_label: Wiring Node
hide_title: true
---

# Wiring Node

Wiring nodes are responsible for defining the interactions with one or more DOM
elements in tests. Each node must be declared in the children object of its
parent with a descriptive key.

## Options

### `findType` (String)

defaults to `'testId'`

The type of
[query](https://testing-library.com/docs/dom-testing-library/api-queries) from
`dom-testing-library` to run

Options are

- [`text`](https://testing-library.com/docs/dom-testing-library/api-queries#bytext)
- [`altText`](https://testing-library.com/docs/dom-testing-library/api-queries#byalttext)
- [`placeholderText`](https://testing-library.com/docs/dom-testing-library/api-queries#byplaceholdertext)
- [`testId`](https://testing-library.com/docs/dom-testing-library/api-queries#bytestid)

### `findValue` (String)

The value to pass in the `findType` query. If the `findType` is `text` then the
`findValue` would be the desired text.

### `isMultiple` (Boolean)

defaults to `false`

Add `isMultiple` to wiring nodes for elements that exist in the dom multiple
times at once. If `isMultiple` is provided, [querying for](find-child.md) the
node will required passing either an index or a filter function, and instead of
a single string being passed to the parent `serialize` functions, an array of
strings will be passed.

### `shouldFindInBaseElement` (Boolean)

defaults to `false`

Useful when trying to interact with elements that write directly to body
(Portals, etc). Instead of searching in it's parent like all other wiring nodes,
`shouldFindInBaseElement` will look in the `baseElement` returned from `render`

### `children` (Object)

An object where the key is the string that will be used to define the name of
the return [element](get-render.md) object and the
[`find{childNode}`](find-child.md) helper, and the value is a wiring node.

> When choosing the at which to store children, if you stick to camel case with
> a lowercase first letter, `react-wiring-library` can correctly translate it
> into its different forms, i.e. `wiringKey`, not `WiringKey` or `wiring_key`.

### `serialize` (Function)

`(element, { ...elementHelpers, ...serializedChildren }) => serializedString`

Takes the DOM element found by the `findType` and `findValue`, any required
helper functions, and the serialized strings of any children, and uses them to
create a single string. This string will be used to represent the dom element in
snapshots.

All of the children of a given node are serialized and the resulting strings are
passed into the parent `serialize` function.

- Standard nodes become `{childNode}String` strings
- `isMultiple` nodes become `{childNode}Strings` arrays.

In addition, a `combine` helpers is provided to help you combine multiple
children into a single string.

If undefined, the element will not be serialized

```javascript
serialize: (val, {singleChildString, multipleChildStrings, combine}) => {
  return combine(val.textContent, singleChildString, ...multipleChildStrings)
},
children: {
    singleChild: {
        ...
    },
    multipleChild: {
        isMultiple: true,
        ...
    },
},
```

### `extend` (Function)

`(element, { ...elementHelpers }) => ({ ...newElementHelpers })`

Takes a DOM element and the helpers for that element, and returns an object with
new functions specifically for interacting with that element. It should be noted
that all built in helpers can be overridden as well, including any
[`find{childNode}`](find-child.md) helpers.

If undefined, the wiring node will not be extended

#### Wiring Node

```javascript
const bar = {
  ...
  parent: {
    ...
    extend: (val, {findFirstChild, findByTestId}) => ({
      findFirstChild: async () => {
        console.log('finding first child')
        return findFirstChild()
      },
    }),
    children: {
      firstChild: {
        ...
        extend: (val, {click}) => ({
          logAndClick: () => {
            console.log('clicked')
            click()
          },
        }),
      },
    },
  },
}
```

#### Test

```javascript
const {findFirstChild} = await findParent()
const {logAndClick, click} = await findFirstChild()
// 'finding first child' is logged
logAndClick()
// 'clicked' is logged
```
