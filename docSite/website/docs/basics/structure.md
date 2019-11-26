---
id: structure
title: Setting up Basic Wiring Structure
sidebar_label: Basic Wiring Structure
hide_title: true
---

# Setting up Basic Wiring Structure

Once we know which parts of our component we want to target, and how we're going
to target them, it's just a matter of a building out the data structure that
`react-wiring-library` will use to traverse your elements.

While the different options for capturing every possible component variation can
get involved, the core idea is very simple. You're building a tree of DOM
elements that are relevant to your tests. Each node in the tree will tell
`react-wiring-library` how to find, interact with, and then serialize a given
element.

## Scaffolding

To get started, we need to add a single file called `testRender.js`(just a
convention). This function will be a replacement for the standard render
function imported from `react-testing-library`. In general, this file contain a
single wiring tree for your whole app.

```javascript
import {getRender} from 'react-wiring-library'

const wiring = {}

export default getRender(wiring)
```

## First wiring node

As `TodoList` is the top level component and is what we'll be serializer, let's
start there. Define a wiring node and target it at the test ID we added in the
previous step.

```javascript
const wiring = {
  children: {
    todoList: {
      findType: 'testId',
      findValue: 'todo-list',
    },
  },
}
```

The [root node](api/wiring-tree.md#the-root-node) of the wiring tree always has
[`children`](api/wiring-node.md#children-object). Setting the key as `todoList`
in this object, means that `findTodoList` will be returned when we call render.

The question then becomes, which DOM element should `findTodoList` return?
That's where [`findType`](api/wiring-node.md#findtype-string) and
[`findValue`](api/wiring-node.md#findvalue-string) come in. `findType`
corresponds to a
[query type](https://testing-library.com/docs/dom-testing-library/api-queries#findby)
from `dom-testing-library` and `findValue` is the argument passed into the
`findBy` version of that query.

So, when we call `findTodoList` it's the equivalent of the following.

```javascript
findByTestId('todo-list')
```

## First Serializer

Now that we the core structure in place, let's add a placeholder serializer to
make sure everything is working.

```javascript
const wiring = {
  children: {
    todoList: {
        ...
      serialize: () => 'TodoList',
    },
  },
}
```

Serializers are just functions that take DOM elements and return easily readable
strings. In this case, we're just returning a static string to confirm the tree
is working.

## First test

Now that we have some wiring to work with, we can actually use
`react-wiring-library` to interact with our component in tests.

Let's create a new test called `TodoList.test.js`.

```javascript
import React from 'react'
import render from './testRender.js'
import TodoList from './TodoList'

describe('TodoList', () => {
  test('should render a list of todos', async () => {
    const {findTodoList, serialize} = render(
      <TodoList
        todos={[
          {
            name: 'Todo One',
          },
          {
            name: 'Todo Two',
          },
        ]}
      />,
    )
  })
})
```

You can see this behaves very similarly to the standard render function from
`react-testing-library`. The exception is that we get back a custom function
called `findTodoList`. This, you'll remember, is based on the fact that we used
`todoList` as a key in `children` object the
[root node](api/wiring-tree.md#the-root-node).

Calling `findTodoList` gets us back a `todoList` DOM element that we can pass
into `toMatchSnapshot` to render out a nice, readable snapshot. For now, let's
just call the `serialize` helper. Instead of actually generating snapshot,
`serialize` just logs the content of the snapshot to the console.

```javascript
describe('TodoList', () => {
  test('should render a list of todos', async () => {
    ...
    const { todoList } = await findTodoList();
    serialize(todoList);
  })
})
```

after calling serialize, this is what we see in the console

```
TodoList
```

Great! This means that supplied test ID is being being found and our component
is being serialized according to the `serialize` function we passed in.

## Source Code

### testRender.js

```javascript
import {getRender} from 'react-wiring-library'

const wiring = {
  children: {
    todoList: {
      findType: 'testId',
      findValue: 'todo-list',
      serialize: () => 'TodoList',
    },
  },
}

export default getRender(wiring)
```

### TodoList.test.js

```javascript
describe('TodoList', () => {
  test('should render a list of todos', async () => {
    const {findTodoList, serialize} = render(
      <TodoList
        todos={[
          {
            name: 'Todo One',
          },
          {
            name: 'Todo Two',
          },
        ]}
      />,
    )
    const {todoList} = await findTodoList()
    serialize(todoList)
  })
})
```

## Next Steps

With the foundation in place, we can generate a snapshot that captures
everything interesting about `TodoList`.
