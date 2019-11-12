---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
hide_title: true
---

# Getting Started

## Installation
```bash
yarn add --dev react-wiring-library 
```

```bash
npm install --save-dev react-wiring-library
```

## The Problem

You love the core and philosophy of `react-testing-library`, but have hit some walls in trying to write tests for your actual components.  Testing individual behaviors is easy and makes a ton of sense, but when it comes to confirming that everything you expect has rendered into the dom, you're stuck between asserting tons of values, or snapshotting the entire dom(the problems of which are well document here). 

Also, the `react-testing-library` model of calling render to get helpers that are specifically targeted at the component you want to test works great for a single test, but when you try reuse that behavior between multiple tests, it becomes really cumbersome and hard to manage. 

## The Solution

`react-wiring-library` is a declarative framework for describing the relevant structure of the components you want to test.  Once you have your components described using simple tree structure, you can create readable, relevant snapshots that capture every value you care about in a single assert.  It also lets you create a simple api of reusable interactions functions that scale with your tests. 

## Example
```javascript
import {getRender} from 'react-wiring-library'
import React from 'react'
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
      {isCompleted && <span>{name}</span>}
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
        todoStrings.map(todoString => `${todoString}\n`)
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
          serialize: (val, {checkBoxString}) => {
            return `${checkBoxString}${val ? val.textContent : ''}$`
          },
          children: {
            checkbox: {
              //findCheckbox = () => findByTestId('checkbox')
              findValue: 'checkbox',
              // convert the checkbox DOM node into the appropriate emoji
              serialize: val => (val.checked ? '☑️' : '◻️'),
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






