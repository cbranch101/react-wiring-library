---
id: dry-tests
title: Making Tests DRY
sidebar_label: Making Tests DRY
hide_title: true
---

# Making Tests DRY
With our first test up and running, it's time to start thinking about a way to wrap up our wiring function calls in a way that we're not having to repeat our querying and interactions in each individual test.  To better illustrate what we mean, let's have two tests, one that asserts what happens when we click on the first todo, and another for clicking on the second.  

> You would usually structure a test like this with multiple assertions in a single test, but we're doing it this way to demonstrate where the repetition comes in. 

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

In both of these cases, all we care about is clicking a particular todo, but we have all a lot of repeated code that's just nuts and bolts implementation details of clicking a todo, and doesn't need to be in the test over and over.  This is one of the biggest sticking points we hit with vanilla `react-testing-library` and is one of the main problems `react-wiring-library` is trying to solve. 

For a simple component like this, you can see there's a fair amount to clean up, but when we scale the tests up to test real components, the amount of repeated code gets out of hand very quickly. 

There are three repeated steps we'd like move from the tests into our wiring code. 
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

In addition to `serialize` and `findValue` there's a third core piece of functionality that you'll add to most of your wiring nodes, and that's `extend`. 

The basic idea of is `extend` is that you're taking the functions a node would normally return and using them to create new functions that are specific to the interactions you need to do with that node. 
To see what that means in action, let's add a `toggle` function to `Todo` that eliminates the first two items in repeated steps list. 

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
    const { toggle } = await findTodo({index: 1})
    await toggle();
```

Instead of having to call `findTodo` to get `findCheckbox` and `findCheckbox` to get `click`, we just call `findTodo` to get `toggle`. That interaction becomes more much clear, and our tests got more DRY. 

Let's unpack what happened there a little bit. 

The second argument passed to extend is all of the functions that would normally be returned from calling `within(element)` in `dom-testing-library` in addition to any custom functions added for the children(in this case `findCheckbox`).  Because we know that we always want to find the checkbox before we click it, we can wrap everything up into a single async function called `toggle` and return it so it's directly available in our tests. 

>As a rule, every interaction that happens in a test should be specifically defined in an extend function and given a descriptive name.  This has two benefits
>1. If the specific implementation of the component changes(you have to click another element, etc), your tests can stay the same. 
>2. Your tests become a very easy to read sequence of queries, descriptive interaction functions, and assertions

## Extending the root node with `toggleTodo`

Before abstracting any further, let's think about specifically what we need to do in each test.  We actually only need to do one thing: toggle a node at a particular position.  We never interact with the list as a whole, and we never interact with a `Todo` other than to toggle it.  

If we want our tests to be as DRY as possible, let's try to have a single function called `toggleTodo` that is the only thing we call in our test.

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

And then our final tests become 

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

Compared with where we started, I think you'll agree this is much more concise and expressive.  To finish things up, let's break apart a couple of key details above. 

The first question is, if `extend` adds functionality to wiring nodes, which node is being extended to add `toggleTodo`?  In this case, it's being added to the root node.  The root node is unique for a few different reasons, but the one we care about is that it allows us to extend the functions that get returned from render, which is what we want to do here. Once we understand how we're extending the root node, everything else that happens is pretty similar to what we've done before.

 Because `todoList` is a child of the root node, its extend function has access to `findTodoList`, which we can then use to get and call `findTodo` with the passed in `index`.  The only remaining wrinkle is that we still need to get access to the `todoList` object returned from `findTodoList` in the tests, so we can call `toMatchSnapshot` on it.  To solve that, we can just have to remember to return it from `toggleTodo`

 At this point, these tests are pretty much good to go.  We're querying, interacting, and asserting using simple, easy to read snapshots.

















