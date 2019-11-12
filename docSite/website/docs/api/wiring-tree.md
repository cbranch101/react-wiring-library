---
id: wiring-tree
title: Wiring Tree
sidebar_label: Wiring Tree
hide_title: true
---

# Wiring Tree

## Structure
A Wiring tree consist of a root node with wiring nodes beneath it.
```
{
  children: {
    todoList: {
      findValue: 'todo-list',
      serialize: (val, {todoStrings, combine}) => combine(...todoStrings),
      children: {
        todo: {
          isMultiple: true,
          findValue: 'todo',
          serialize: (val, {checkBoxString}) => {
            return `${checkBoxString}${val ? val.textContent : ''}$`
          },
          children: {
            checkbox: {
              findValue: 'checkbox',
              serialize: val => (val.checked ? '☑️' : '◻️'),
            },
          },
        },
      },
    },
    otherComponent: {
        ...
    }
  },
}
```

### The Root Node

The root node is the only node in the wiring tree that does not correspond to an actual dom node.  It has two main roles within the tree. 

#### 1. Only it's direct children can be serialized
If an object needs to be serialized using `serialize` or `toMatchSnapshot` make sure that's its declared as a direct child of the root. 
#### 2. It allows new functionality to be returned from `render`
If you provide `extend` to the root node, everything returned from `extend` will also be returned from `render`

All of the following properties are invalid on a root node
- findValue / findType
- getCurrentType
- types
- isMultiple
- shouldFindInBaseElement
- serialize

### Wiring Nodes

These are all other nodes are standard wiring nodes, which are responsible for defining the interactions with one or more dom nodes in tests. Each node must be declared in the children object of its parent with a descriptive key. 

## Wiring Node Options

### `findType`

defaults to `testId`

The type of [query](https://testing-library.com/docs/dom-testing-library/api-queries) from `dom-testing-library` to run

Options are
- [`text`](https://testing-library.com/docs/dom-testing-library/api-queries#bytext)
- [`altText`](https://testing-library.com/docs/dom-testing-library/api-queries#byalttext)
- [`placeholderText`](https://testing-library.com/docs/dom-testing-library/api-queries#byplaceholdertext)
- [`testId`](https://testing-library.com/docs/dom-testing-library/api-queries#bytestid)

### `findValue`

The value to pass in the `findType` query.  If the `findType` is `text` then the `findValue` would be the desired text.

### `isMultiple`

defaults to `false`

Add `isMultiple` to wiring nodes for elements that exist in the dom multiple times at once.  If `isMultiple` is provided, querying for the node will required passing either an index or a filter function, and instead of a single string being passed to the parent `serialize` functions, an array of strings will be passed. 

### `shouldFindInBaseElement`

Useful when trying to interact with elements that write directly to body tag(Portals, etc).  Instead of searching its its parent like all other wiring nodes, `shouldFindInBaseElement` will look in the `baseElement` returned from `render`

### `serialize`

`(element, helpersFunctions, baseString) => serializedString`

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

If undefined, the element will not be serialized

`serialize` takes the dom element found by the `findType` and `findValue`, any required helper functions, and the serialized strings of any children, and uses them to create a single string.  This string will be used to represent the dom node in snapshots and when calling the `serialize` helper manually. 

serialize runs from the bottom of the tree to the top, with strings of the serialized children being passed into their parent's `serialize` function in the format of a single `${wiringKey}String` string for standard wiring nodes, and a `${wiringKey}Strings` array for `isMultiple` wiring nodes.  

### `extend`

`(element, helperFunctions) => newFunctionObject`

#### Example Wiring Node
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

#### Example Test
```javascript
const {findFirstChild} = await findParent()
const {logAndClick, click} = await findFirstChild()
// 'finding first child' is logged
logAndClick()
// 'clicked' is logged
```


If undefined, the wiring node will not be extended

`extend` takes a dom element, and the helper functions specific to that dom element(and any global helper functions) and returns an object with new functions specific for interacting with that dom node. 

If the returned functions correspond to existing helpers(the `find${wiringKey}` helper, etc) it can also be used to override existing functionality. 















