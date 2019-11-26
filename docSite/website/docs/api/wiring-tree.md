---
id: wiring-tree
title: Wiring Tree
sidebar_label: Wiring Tree
hide_title: true
---

# Wiring Tree

## Structure

A Wiring Tree consists of a root node with wiring nodes beneath it.

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

## The Root Node

The root node is the only node in the wiring tree that does not correspond to an
actual dom node. It has two main roles within the tree.

### 1. Only it's direct children can be serialized

If an object needs to be serialized using
[`serialize`](wiring-node.md#serialize-function) or `toMatchSnapshot` make sure
that's its declared as a direct child of the root.

### 2. It allows new functionality to be returned from `render`

If you provide [`extend`](wiring-node.md#extend-function) to the root node,
everything returned from [`extend`](wiring-node.md#extend-function) will also be
returned from `render`

All of the following properties are invalid on a root node

- [findValue](wiring-node.md#findvalue-string) /
  [findType](wiring-node.md#findtype-string)
- [getCurrentType](abstract-wiring-node.md#getcurrenttype)
- [types](abstract-wiring-node.md#types-object)
- [isMultiple](wiring-node.md#ismultiple-boolean)
- [shouldFindInBaseElement](wiring-node.md#shouldfindinbaseelement-boolean)
- [serialize](wiring-node.md#serialize-function)
