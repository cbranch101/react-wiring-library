---
id: structure
title: Setting up Basic Wiring Structure
sidebar_label: Basic Wiring Structure
hide_title: true
---

# Setting up Basic Wiring Structure

To get started, we need to add a single file called `testRender.js`(just a convention). This function will be a replacement for the standard render function imported from `react-testing-library`.  In general, This file will define all of the test interactions and serializers(wiring) for your entire app. 

In this file, import `getRender` pass in your wiring object, and export the result of calling the function so it can be used in your tests

```javascript
import {getRender} from 'react-wiring-library'

const wiring = {}

export default getRender(wiring)
```

## First wiring node

Let's fill in the first piece of wiring.  Becaue TodoList is the top level component we want to serialize in our test, let's start there. Let's define a wiring node and target it at the test ID we added in the previous step. 

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

The wiring object is a tree, so the top level key is children.  Setting the key as `todoList` in the children object, means that `findTodoList` will be returned when we call render. 

The question then becomes, what should `findTodoList` return when called?  That's where `findType` and `findValue` come in.  `findType` corresponds to a [query type](https://testing-library.com/docs/dom-testing-library/api-queries#findby) from `dom-testing-library` and `findValue` is the argument passed into the `findBy` version of that query. 

So, when we call `findTodoList` it's the equivalent of the following

```javascript
findByTestId('todo-list')
```

## First Serializer
Now that we the core structure in place, let's add a placeholder serializer to make sure everything is working

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

Serializers are just functions that take dom elements and return easily readable strings that can be snapshotted in tests.  In this case, we're just returning a static string to confirm the wiring is working

## First test
Now that we have some wiring to work with, we can actually use `react-wiring-library` to interact with our component in tests. 

Let's create a new test called `TodoList.test.js` and render `TodoList` in simple test using the function we created in `testRender.js`

```javascript
import React from 'react'
import render from './testRender.js'
import TodoList from './TodoList'

describe('TodoList', () => {
  test('should render a list of todos', async () => {
    const {findTodoList, serialize } = render(
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

You can see this behaves very similarly to the standard render function from `react-testing-library`, with the only exception being that we get back a custom function called `findTodoList`. This, you'll remember, is based on the fact that we used `todoList` as a key in the top level children object.

Calling `findTodoList` gets us back a `todoList` object that points at our rendered component that we can pass into `toMatchSnapshot` which will then call the serializers and render out a nice, readable snapshot.  For now, let's just call the `serialize` helper.  Instead of actually generating snapshot, the serializer just logs the content of the snapshot to the console. 

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

Great! This means that supplied test ID is being being found and our component is being serialized according to the `serialize` function we passed in.  

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
    const {findTodoList, serialize } = render(
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
    const { todoList } = await findTodoList();
    serialize(todoList);
  })
})
```


## Next Steps

With the foundation in place, now we can generate a snapshot that captures everything relevant about our component.  














