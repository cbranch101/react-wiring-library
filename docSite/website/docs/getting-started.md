---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
hide_title: true
---

# Getting Started

## The Problem

You've tried `react-testing-library` and love its core API, but have struggled
with getting to full coverage on complicated components. Testing isolated
interactions is easy enough, but when multiple parts of a component change at
once, or you have to take complex sequencing into account, your tests become
significantly harder to write and maintain.

## The Solution

By letting you describe the relevant structure of your component tree in
advance, `react-wiring-library` makes fully testing complicated components not
only possible, but intuitive and scalable.

The wiring tree's structure lets you wrangle your complex interaction code,
generate developer-friendly snapshots, and easily customize
`react-testing-library`'s API to the specifics of your project.

## 1. Install deps

```bash
yarn add --dev react-wiring-library
```

```bash
yarn add --dev @testing-library/react
```

## 2. Review Prerequisites

`react-wiring-library` is built off of `react-testing-library`, so a basic
familiarity with that framework is required. In particular, make sure to take a
look at the different
[queries](https://testing-library.com/docs/dom-testing-library/api-queries) that
are available, and how they work.

## 3. Run the example

Copy this test into your project and run it.

```javascript
import {getRender} from 'react-wiring-library'
import React, {useState} from 'react'

const Todo = ({name}) => {
  const [isCompleted, setIsComplete] = useState(false)
  return (
    <div>
      <input
        data-testid="checkbox"
        onClick={() => setIsComplete(prev => !prev)}
        type="checkbox"
      />
      {!isCompleted && <span>{name}</span>}
    </div>
  )
}

const TodoList = ({todos}) => {
  return (
    <ul data-testid="todo-list">
      {todos.map((todo, index) => (
        <li data-testid="todo" key={index}>
          <Todo name={todo.name} />
        </li>
      ))}
    </ul>
  )
}

const wiringTree = {
  children: {
    // query will be findTodoList and returned object will be todoList

    todoList: {
      // findTodoList => findByTestId('todo-list')
      findValue: 'todo-list',
      // combine the child `todoStrings` into a single string with each todo on a new line
      serialize: (val, {todoStrings}) => {
        return todoStrings.map(string => `- ${string}`).join('\n')
      },
      children: {
        todo: {
          // findTodo = ({ index }) => findAllbyTestId('todo')[index]
          isMultiple: true,
          findValue: 'todo',
          // makes this possible
          // { toggle } = await findTodo({ index: 0 }}
          extend: (val, {findCheckbox}) => {
            return {
              toggle: async () => {
                const {click} = await findCheckbox()
                click()
              },
            }
          },
          // combine the serialized check box with the text content of the 'todo' DOM node
          // - ✅ Todo One
          serialize: (val, {checkboxString}) => {
            return `${checkboxString}  ${val ? val.textContent : ''}`
          },
          children: {
            checkbox: {
              //findCheckbox = () => findByTestId('checkbox')
              findValue: 'checkbox',
              // convert the checkbox DOM node into the appropriate emoji
              serialize: val => (val.checked ? '✅' : '⬜️'),
            },
          },
        },
      },
    },
  },
}

const render = getRender(wiringTree)

describe('TodoList', () => {
  test('should render a list of todos', async () => {
    const {findTodoList} = render(
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
    const {
      todoList, // the dom element returned by `findByTestId('todo-list')
      findTodo, // findByTestId('todo-list')
    } = await findTodoList()
    // -◻️ Todo One
    // -◻️ Todo Two
    expect(todoList).toMatchSnapshot('on initial render')
    const {
      toggle, // the function created in extend
    } = await findTodo({
      index: 0, // get the first todo, could also pass { filter: (todo) => // filter todos to one }
    })
    await toggle()
    // -✅ Todo One
    // -◻️ Todo Two
    expect(todoList).toMatchSnapshot('after clicking first todo')
  })
})
```

## 4. Get a Feel

First, take a look at the snapshots generated after the tests run. If you're
using VSCode, we'd highly recommend adding
[snapshot-tools](https://marketplace.visualstudio.com/items?itemName=asvetliakov.snapshot-tools)
to make it easier work with snapshots.

Here's a few things you could try to familiarize yourself with the basics.

- Comment out the toggle call on line 143 and see how the tests fail.
- Add a new assert for clicking on the second todo.
- Change the values returned by the serializers and note how the tests fail.
- Change the `data-testid` attribute on `todo` to something else, and note the
  error that gets thrown.
- Change the key of `todoList` to just `list` and update everything that's
  dependent on the change.

## 5. Jump into the tutorials

Now that you've got the lay of the land, check out the
[basic tutorials](basics/prepping.md)
