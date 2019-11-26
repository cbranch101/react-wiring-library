---
id: prepping
title: Prepping Components For Testing
sidebar_label: Prepping Components
hide_title: true
---

# Prepping Components

The core idea of `react-wiring-library` is to offload the majority of the
annoying DOM traversal code to the framework, allowing you to focus on testing
behavior. For that to be possible, you need to tell `react-wiring-library` which
parts of the DOM it should care about. Most of the time, this means you'll need
to make a few changes to your components.

## The Component to Test

```javascript
const Todo = ({name}) => {
  const [isCompleted, setIsComplete] = useState(false)
  return (
    <div>
      <input onClick={() => setIsComplete(prev => !prev)} type="checkbox" />
      {isCompleted && <span>{name}</span>}
    </div>
  )
}

const TodoList = ({todos}) => {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>
          <Todo name={todo.name} />
        </li>
      ))}
    </ul>
  )
}
```

## Target Relevant Elements

There are several
[different ways](https://testing-library.com/docs/dom-testing-library/api-queries#queries)
to target elements based on their content, and if none of those work, we just
add `data-testid` attributes where relevant.

In `TodoList` there are three elements we care about

- TodoList as a whole
- Todo
- The Todo checkbox

In general, focus on elements that are going to change in your tests. If there's
nothing to verify, don't bother targeting or serializing them.

Because `TodoList` is the top level element and we're going to call
`toMatchSnapshot` on it, this element will always need to have a test ID, even
if we could target it some other way(by text, etc).

> Always add the data-testid attribute to the top level of any element you want
> to serialize so that `react-wirig-library`'s serializers can find it.

```javascript
const TodoList = ({todos}) => {
  return <ul data-testid="todo-list">...</ul>
}
```

Next, add a test ID to `Todo`. This will let us serialize and interact with the
individual `Todo`s.

```javascript
...
<li data-testid="todo" key={index}>
  <Todo name={todo.name} />
</li>
...
```

Finally, target the checkbox so we can can click it.

```javascript
...
  <input
    data-testid="checkbox"
    onClick={() => setIsComplete(prev => !prev)}
    type="checkbox"
  />
...
```

## Source Code

```
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
```

## Next steps

Next, let's create the basic scaffolding required to actually test.
