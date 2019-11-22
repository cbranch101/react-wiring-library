---
id: testing-interactions
title: Testing Interactions
sidebar_label: Testing Interactions
hide_title: true
---

# Testing Interactions

Now that we've successfully described the structure of our components, and built out our serializers to so we can verify their structure, it's just a matter of actually testing.  Every line of our tests should be one of three things

1. Calling custom async `find` functions to get access to a given element
2. Calling returned helpers to interact with elements
3. Calling `toMatchSnapshot` to assert the correct behavior. 


## Review
To review, let's look at where we were with our test

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

We've added the required test ids to our component, so that we can use `findTodoList` and get access to `todoList` and use our custom serializer to assert what's being rendered to the dom.   

## Testing initial render

A good first step is to confirm that the component is doing what we expect on initial load. We've pretty much got everything in place do that already.  All we need to do is switch from using `serialize` which is just an internal helper to help us look what the serialziers will spit out when they run, to actually calling `toMatchSnapshot`

```javascript
  test('should render a list of todos', async () => {
    ...
    const {todoList} = await findTodoList()
    expect(todoList).toMatchSnapshot('on initial render');
  })
```

Other than calling `toMatchSnapshot` the only other detail of note here is to always remember to pass a title into `toMatchSnapshot`.  When tests fail, this title makes it easier to sort out which snapshot is failing. 

If we run the test, we'll see that a snapshot was generated which looks like this.

```javascript
exports[`TodoList should render a list of todos: on initial render 1`] = `
-◻️ Todo One
-◻️ Todo Two"
`;
```

On initial render, we're expecting the todo list to render with its checkboxes unchecked and the correct names displayed.  Everything looks right in the snapshot, so we can move on. 

Other than rendering the list of todos we pass in, the only other functionality we care about is the ability to click a checkbox and toggle the completion of a todo. Let's go through that now. 

## Query for the first todo

We've successfully gotten the whole `TodoList` but for us to be able to click on an individual `Todo`, first we need to query for one.  Let's get the function we need to query for a single todo. 

```javascript
    ...
    const {todoList, findTodo} = await findTodoList()
```

Because `todoList` has a key of `todo` in its `children` object calling `findTodoList` will return `findTodo` which we can then use to query for a single.  Before we move on to how that works, let's review what the wiring for todo looks like. 

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

If `todo` were a standard node wiring node, we could just call `findTodo` and go about our business.  But, because `isMultiple` is declared as true and `todo` exists in the dom multiple times at once, we need to actually tell `findTodo` which `todo` to return. 

There are two ways to do this.  You can either pass in an array index to specify which element you want, or you can pass in a filter function.  Let's start by querying by index and just getting the first todo. 

```javascript
    ...
    const {todoList, findTodo} = await findTodoList()
    await findTodo({ index: 0 })
```

If this functions run successfully without throwing an error, we know everything was wired together correctly and we're finding the todo in question.

## Clicking a todo

The core model of `react-testing-library` and by extension `react-wiring-library` is to call functions, and get back new, more specific functions for what we want to do.  In keeping with that, we're going to call a function to get down to the actual checkbox, and then call a function to click on it. 

```javascript
    ...
    const {todoList, findTodo} = await findTodoList()
    expect(todoList).toMatchSnapshot('on initial render');
    const { findCheckbox } = await findTodo({ index: 0 })
    const { click } = await findCheckbox();
    click();
    expect(todoList).toMatchSnapshot('after clicking first todo');
```

The process for going from the the todo to its checkbox shouldn't be super surprising at this point. `checkbox` is a child of `todo` so `findCheckbox` gets returned from `findTodo`.  

The new element here is the `click` function that gets returned from `findCheckbox`. All of the added find functions(findCheckbox, findTodo, etc) will return `click` by default, which will in turn click that element when you call it. This is what our newly generated snapshot should look like. 

```javascript
exports[`TodoList should render a list of todos: after clicking first todo 1`] = `
-☑️
-◻️ Todo Two"
`;
```

Great! This is exactly what we'd expect.  The checkbox is checked and the name for the checked todo no longer displays.  

At this point, we have a functioning test.  We're able to render a component, interact with it, and then verify that everything we care about has rendered to the dom correctly, all using easy to read and understand snapshots.  

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
With the test functionality in place, we'll finish things out by cleaning up our wiring interactions in a way that will make our tests much more readable and scalable. 



















