---
id: prepping
title: Prepping Components For Testing
sidebar_label: Prepping Components
hide_title: true
---

# Prepping Components

Before setting up test wiring, there's some basic preparation we need to do first


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

Before `react-wiring-library` can find and interact with and serialize your elements in tests, we need to be sure it's possible to target them in some way. There are several [different ways](https://testing-library.com/docs/dom-testing-library/api-queries#queries) to target elements based on their content, and if none of those work, we just add `data-testid` attributes where relevant.

In `TodoList` there are three elements we care about
- TodoList as a whole
- Todo
- The Todo checkbox

In general, focus on elements that are going to change in some relevant way in your tests.  If there's nothing to verify, don't bother targeting or serializing them. 

Because `TodoList` is the top level that were going to call `toMatchSnapshot` on in our tests, it always needs to have a test ID (so the serializer can find it), even if it was possible to target it some other way

```javascript
const TodoList = ({todos}) => {
  return (
    <ul data-testid="todo-list">
        ...
    </ul>
  )
}
```

Next, add a test ID to Todo so we can built out the list in serializer and interact with the individual items in the list

```javascript
...
<li data-testid="todo" key={index}>
  <Todo name={todo.name} />
</li>
...
```

Finally, target the checkbox so we can can click it
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
Now let's create the basic scaffolding required to actually test