---
id: testing-interactions
title: Testing Interactions
sidebar_label: Testing Interactions
hide_title: true
---

# Testing Interactions

With our serializers in place, we can actually test. Every line of our tests
should be one the following three things.

1. Calling [`find{childNode}`](api/find-child.md) helpers to get access to a
   given element.
2. Calling returned helpers to interact with elements.
3. Calling `toMatchSnapshot` to assert the correct behavior.

## Review

To review, let's look at where we were with our test.

## TodoList.test.js

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

## Testing initial render

To start, let's confirm the initial render. Luckily, we've pretty much got
everything in place to do that already. All we need to do is switch from using
`serialize` to actually calling `toMatchSnapshot`

```javascript
  test('should render a list of todos', async () => {
    ...
    const {todoList} = await findTodoList()
    expect(todoList).toMatchSnapshot('on initial render');
  })
```

The only detail of note here is that you should always pass a title into
`toMatchSnapshot`. When tests fail, this title makes it easier to figure out
which snapshot is failing.

If we run the test, we'll see that a snapshot that looks like this.

```javascript
exports[`TodoList should render a list of todos: on initial render 1`] = `
-◻️ Todo One
-◻️ Todo Two"
`
```

On the initial render we're expecting the `TodoList` to have unchecked
checkboxes alongside the passed in names. Everything looks right in the
snapshot, so we can move on.

The only other functionality we care about is the ability toggle the completion
of a `Todo`.

## Query for the first todo

For us to be able to click on an individual `Todo` we need to query for it.

```javascript
    ...
    const {todoList, findTodo} = await findTodoList()
```

Because `todo` is a child of `todoList`, calling `findTodoList` will return
`findTodo`, which we can then use to query for a single `todo`. Before we move
on to how that works, let's review what the wiring for `todo` looks like.

### Todo wiring

```javascript
todo:  {
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
}
```

Because `todo` is an `isMultiple` node we need to actually tell `findTodo` which
of the multiple todos it found to return.

The easiest way to do this is to just specify the index of the item you're
interested in.

```javascript
    ...
    const {todoList, findTodo} = await findTodoList()
    await findTodo({ index: 0 })
```

If this function runs successfully without throwing an error, we know everything
was wired together correctly and we're finding the todo in question.

## Clicking a todo

The core model of `react-testing-library` and by extension
`react-wiring-library` is to call helpers, and get back new, more specific
helpers for interacting with a specific element. In keeping with that, we're
going to call a function to get down to the actual checkbox, and then call a
helper to click on it.

```javascript
    ...
    const {todoList, findTodo} = await findTodoList()
    expect(todoList).toMatchSnapshot('on initial render');
    const { findCheckbox } = await findTodo({ index: 0 })
    const { click } = await findCheckbox();
    click();
    expect(todoList).toMatchSnapshot('after clicking first todo');
```

The process for going from the the todo to its checkbox shouldn't be super
surprising at this point. `checkbox` is a child of `todo` so `findCheckbox` gets
returned from `findTodo`, which then returns `click` so we can click the
checkbox.

```javascript
exports[
  `TodoList should render a list of todos: after clicking first todo 1`
] = `
-☑️
-◻️ Todo Two"
`
```

Great! This is exactly what we'd expect. The checkbox is checked and the name
for the checked todo no longer displays.

## Source Code

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
    const {todoList, findTodo} = await findTodoList()
    expect(todoList).toMatchSnapshot('on initial render')
    const {findCheckbox} = await findTodo({index: 0})
    const {click} = await findCheckbox()
    click()
    expect(todoList).toMatchSnapshot('after clicking first todo')
  })
})
```

## Next Steps

At this point, we've made it through all of the basic steps in the testing
process. You should have a pretty clear idea what it takes to start adding
`react-wiring-library` tests to your components.

If you'd like to dig deeper, let's take a look at some ways we can make our
tests less repetitive and easier to read.
