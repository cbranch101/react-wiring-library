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

You've tried `react-testing-library` and love its core api, but have struggled with achieving full coverage on your more complicated components.  Testing isolated interactions is easy enough, but when multiple parts of a component change at once, or you have to take complex sequencing into account, your tests become unworkable. 

## The Solution

By letting you describe the relevant structure of your component tree in advance, `react-wiring-library` makes fully testing complicated components not only possible, but intiutive and scalable. 

The wiring tree's structure lets you fully wrangle your interaction code, generate developer friendly snapshots, and easily customize `react-testing-library`'s api to the specifics of your project.

## Installation
```bash
yarn add --dev react-wiring-library 
```

```bash
yarn add --dev @testing-library/react 
```

## Prerequisites

`react-wiring-library` is built off of `react-testing-library`, so a basic familiarity with that framework is required.  Particularly, take a look at the different [queries](https://testing-library.com/docs/dom-testing-library/api-queries) that are available, and how they work.  


## Run The Example

Copy this test file into an app set up to run jest tests, and run it

```javascript
import { getRender } from 'react-wiring-library'
import React, { useState } from 'react'

const Todo = ({ name }) => {
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

const TodoList = ({ todos }) => {
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
            serialize: (val, { todoStrings }) => {
                return todoStrings.map(string => `- ${string}`).join('\n')
            },
            children: {
                todo: {
                    // findTodo = ({ index }) => findAllbyTestId('todo')[index]
                    isMultiple: true,
                    findValue: 'todo',
                    // makes this possible
                    // { toggle } = await findTodo({ index: 0 }}
                    extend: (val, { findCheckbox }) => {
                        return {
                            toggle: async () => {
                                const { click } = await findCheckbox()
                                click()
                            },
                        }
                    },
                    // combine the serialized check box with the text content of the 'todo' DOM node
                    // - ✅ Todo One
                    serialize: (val, { checkboxString }) => {
                        return `${checkboxString}  ${
                            val ? val.textContent : ''
                        }`
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
        const { findTodoList } = render(
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

## The Lay of the Land

First, take a look at the snapshots generated after the tests run.  If you're using VSCode, we'd highly recommend adding [snapshot-tools](https://marketplace.visualstudio.com/items?itemName=asvetliakov.snapshot-tools) to make it easier work with snapshots. 

Here's a few things you could try to familiarize yourself with the basics. 

- Comment out the toggle call on line 143 and see how the tests fail
- Add a new assert for clicking on the second todo
- Change the values returned by the serializers and note how the tests fail
- Change the `data-testid` attribute on `todo` to something else, and note the error that gets thrown
- Change the key of `todoList` to just `list` update everything that's dependent on the change

## Next Steps

Now that you've got the lay of the land, check out the [basic tutorials]([basics/prepping.md](http://localhost:3000/docs/basics/prepping))

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