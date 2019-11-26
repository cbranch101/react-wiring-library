---
id: dry-tests
title: Using Extend To Make Tests DRY
sidebar_label: Using Extend To Make Tests DRY
hide_title: true
---

# Using Extend To Make Tests DRY

With our first test up and running, it's time to start thinking about a way to
wrap up our wiring function calls so that we're not having to repeat our
querying and interactions in each individual test. To better illustrate what we
mean, let's create two tests, each clicking a different todo.

> You wouldn't usually structure a test like this with multiple assertions in a
> single test, but we're doing it this way to demonstrate where the repetition
> comes in.

```javascript
const fixture = (
  <TodoList
    todos={[
      {
        name: 'Todo One',
      },
      {
        name: 'Todo Two',
      },
    ]}
  />
)

describe('TodoList', () => {
  test('should toggle the first todo', async () => {
    const {findTodoList} = render(fixture)
    const {findTodo} = await findTodoList()
    const {findCheckbox} = await findTodo({index: 0})
    const {click} = await findCheckbox()
    click()
    expect(todoList).toMatchSnapshot('after clicking first todo')
  })
  test('should toggle the second todo', async () => {
    const {findTodoList} = render(fixture)
    const {findTodo} = await findTodoList()
    const {findCheckbox} = await findTodo({index: 1})
    const {click} = await findCheckbox()
    click()
    expect(todoList).toMatchSnapshot('after clicking second todo')
  })
})
```

The problem here is that all we care about is clicking a particular todo, but
our tests are filled with repeated code. This is one of the biggest sticking
points we hit with vanilla `react-testing-library.

For a simple component like this, you can see there's a fair amount to clean up,
but for a real component, the amount repeated code can become very cumbersome.

There are three repeated steps we'd like move from the tests into our wiring.

1. Getting `click` from `findCheckbox` and calling it
2. Getting `findCheckBox` from `findTodo`
3. Getting `findTodo` from `findTodoList`

## Extending `Todo` with `toggle`

### `testRender.js` from previous step

```javascript
{
  children: {
    todoList: {
      findValue: 'todo-list',
      serialize: (val, {todoStrings}) => {
        todoStrings.map(todoString => `${todoString}\n`)
      },
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
  },
}
```

In addition to [`serialize`](api/wiring-tree.md#serialize-function) and
[`findValue`](api/wiring-tree.md#findvalue-string) there's a third core piece of
functionality that you'll add to most of your wiring nodes, and that's
[`extend`](api/wiring-tree.md#extend-function).

The basic idea of is `extend` is that you're adding custom helpers to a given
node. To see what that means in action, let's add a `toggle` function to `Todo`
that eliminates the first two items in repeated steps list.

```javascript
...
todo: {
  isMultiple: true,
  findValue: 'todo',
  extend: (val, {findCheckbox}) => {
    return {
      toggle: async () => {
        const {click} = await findCheckbox()
        click()
      },
    }
  },
  ...
}
```

Also, let's update the tests

```javascript
//const {findCheckbox} = await findTodo({index: 0})
//const {click} = await findCheckbox()
//click();
const {toggle} = await findTodo({index: 1})
await toggle()
```

Let's unpack what happened there a little bit.

Like `serialize` the object in the second argument of `extend` contains all of
the helpers for interacting with that element. What's unique about `extend`
however, is that this object also contains all of the `find{childNode}` helpers
for the current node's children.

In this case, we know that we always want to find the checkbox and click on it,
so we can use the `findCheckbox` helper created for the `checkbox` node to
create `toggle` to eliminate the intermediate finding step.

> As a rule, every interaction that happens in a test should be specifically
> defined in an extend function and given a descriptive name. This has two
> benefits
>
> 1.  If the specific implementation of the component changes, your tests can
>     stay the same.
> 2.  Your tests become a very easy to read sequence of queries, descriptive
>     interaction functions, and assertions.

If we want our tests to be as DRY as possible, let's try to have a single
function called `toggleTodo` that is the only thing we call in our test.

```javascript
{
  extend: (val, {findTodoList}) => {
    return {
      toggleTodo: async index => {
        const {findTodo, todoList} = await findTodoList()
        const {toggle} = await findTodo({index})
        await toggle()
        return {
            todoList
        }
      },
    }
  },
  children: {
    todoList: {
        ...
    },
  },
}
```

And then our final tests look like this.

```javascript
describe('TodoList', () => {
  test('should toggle the first todo', async () => {
    const {toggleTodo} = render(fixture)
    const {todoList} = await toggleTodo(0)
    expect(todoList).toMatchSnapshot('after clicking first todo')
  })
  test('should toggle the second todo', async () => {
    const {toggleTodo} = render(fixture)
    const {todoList} = await toggleTodo(1)
    expect(todoList).toMatchSnapshot('after clicking second todo')
  })
})
```

Compared with where we started, I think you'll agree this is much more concise
and expressive. To finish things up, let's break apart a couple of key details
above.

The first question is, if `extend` adds functionality to wiring nodes, which
node is being extended to add `toggleTodo`? In this case, it's being added to
the root node. The root node is unique for a
[few different reasons](api/wiring-tree.md#the-root-node), but the one we care
about is that it allows us to extend the functions that get returned from
render, which is what we want to do here. Once we understand how we're extending
the root node, everything else that happens is pretty similar to what we've done
before, with the only wrinkle being that we need to remember to pass long
`todoList` so we still have access to in our tests.
