<div align="center">
<h1>React Wiring Library</h1>

<a href="https://i.imgur.com/AFuVnpE.png">
  <img
    height="80"
    width="80"
    alt="goat"
    src="https://i.imgur.com/AFuVnpE.png"
  />
</a>

<p>A declarative framework for building structured react-testing-library tests with readable snapshots and simple reusability.</p>

<br />

[**Read The Docs**](https://react-wiring-library.now.sh)

<br />
</div>

<hr />

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package] 
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]

[![PRs Welcome][prs-badge]][prs]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]


## The Problem

You love the core and philosophy of `react-testing-library`, but have hit some walls in trying to write tests for your actual components.  Testing individual behaviors is easy and makes a ton of sense, but when it comes to confirming that everything you expect has rendered into the dom, you're stuck between asserting tons of values, or snapshotting the entire dom(the problems of which are well document here). 

Also, the `react-testing-library` model of calling render to get helpers that are specifically targeted at the component you want to test works great for a single test, but when you try reuse that behavior between multiple tests, it becomes really cumbersome and hard to manage. 

## The Solution

`react-wiring-library` is a declarative framework for describing the relevant structure of the components you want to test.  Once you have your components described using simple tree structure, you can create readable, relevant snapshots that capture every value you care about in a single assert.  It also lets you create a simple api of reusable interactions functions that scale with your tests. 

## Installation
```bash
yarn add --dev react-wiring-library 
```

```bash
npm install --save-dev react-wiring-library
```

## Example
```jsx
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

## LICENSE

[MIT](LICENSE)

<!-- prettier-ignore-start -->

[build-badge]: https://img.shields.io/travis/cbranch101/react-wiring-library.svg?style=flat-square
[build]: https://travis-ci.org/cbranch101/react-wiring-library
[coverage-badge]: https://img.shields.io/codecov/c/github/cbranch101/react-wiring-library.svg?style=flat-square
[coverage]: https://codecov.io/github/cbranch101/react-wiring-library
[version-badge]: https://img.shields.io/npm/v/react-wiring-library.svg?style=flat-square
[package]: https://www.npmjs.com/package/react-wiring-library
[downloads-badge]: https://img.shields.io/npm/dm/react-wiring-library.svg?style=flat-square
[npmtrends]: https://www.npmtrends.com/react-wiring-library/
[license-badge]: https://img.shields.io/npm/l/react-wiring-library.svg?style=flat-square
[license]: https://github.com/testing-library/react-wiring-library/blob/master/LICENSE
[github-watch-badge]: https://img.shields.io/github/watchers/cbranch101/react-wiring-library.svg?style=social
[github-watch]: https://github.com/cbranch101/react-wiring-library/watchers
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[github-star-badge]: https://img.shields.io/github/stars/cbranch101/react-wiring-library.svg?style=social
[github-star]: https://github.com/testing-library/react-wiring-library/stargazers
<!-- prettier-ignore-end -->