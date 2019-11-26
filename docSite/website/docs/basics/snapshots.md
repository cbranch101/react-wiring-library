---
id: snapshots
title: Building Readable Snapshots
sidebar_label: Building Readable Snapshots
hide_title: true
---

# Building Readable Snapshots

With our basic serializer in place, let's turn `TodoList` into a string that's
simple enough to understand quickly, but detailed enough to capture all of the
ways our tests could go wrong.

## Component To Test

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

## Wiring Node for Todo

Directly below `TodoList`, we see a new wrinkle we haven't encountered yet.
`Todo` is DOM element that appears multiple times at once. Let's add a node to
handle for this.

```javascript
const wiring = {
  children: {
    todoList: {
      findValue: 'todo-list',
      serialize: () => 'TodoList',
      children: {
        todo: {
          isMultiple: true,
          findValue: 'todo',
          serialize: () => '-Todo',
        },
      },
    },
  },
}
```

It's worth noting that `findType: testId` is no longer being provided here,
because it's the default.

Adding `isMultiple` to a wiring node makes `react-wiring-library` treat is as an
array.

A few different parts of the wiring system will be aware of this change down the
road, but for now it's enough to remember to pass `isMultiple` if the
`findValue` you're querying can be found more than once.

> Internally, adding `isMultiple` to a node causes the `find{childNode}` helper
> for that node to use `findAllBy` instead of `findBy`

Let's quickly rerun the test to see how the value of `serialize` has changed.

```
TodoList
```

It hasn't changed at all. This is because the `todoList` wiring always returns
the same string. To display something useful, the `todoList` `serialize`
function needs to combine the serialized values of its children.

## Combining Todos into TodoList

In addition to all of the helpers for the element being serialized, the object
in the second argument of `serialize` will also contain the serialized strings
of all of its children. In this case, because `Todo` has `isMultiple`, and a
wiring key of `todo`, the passed variable is an array of strings called
`todoStrings`

```javascript
    ...
    todoList: {
      ...
      serialize: (val, {todoStrings}) => {
        return todoStrings.map(todoString => `${todoString}\n`)
      },
      children: {
        todo: {
            ...
        },
      },
    }
```

> The second argument of `serialize` will be passed a `{childNode}String` string
> for standard nodes, and a `{childNode}Strings` array for `isMultiple` nodes.

For `TodoList` to correct handle it's children, all we need to do is combine the
array of serialized string in `todoStrings` together.

> In general, when combining together multiple elements in serializers, try to
> have them on multiple lines instead of on a single line. When a test fails the
> diff that jest displays for the snapshot is easier to read when the values are
> on separate lines.

After this change, serialize shows the following.

```
-TodoList
-TodoList
```

This pattern of combining the serialized child strings on their own line is very
commen. For that reason, the second argument of `serialize` gets passed a helper
called `combine` for just such a task.

```javascript
    ...
    todoList: {
      ...
      serialize: (val, {todoStrings, combine}) => combine(...todoStrings),
      ...
    }
```

All of the strings passed to `combine` will be joined together on their own line
with undefined values being skipped.

## Fully serialize Todo

With the list in place, let's make Todo use the actual content rendered to the
DOM.

```javascript
    todoList: {
        ...
      children: {
        todo: {
          ...
          serialize: val => `-${val.textContent}`,
        },
      },
    }
```

`val` in this case is the `Todo` DOM node, so we're able to just get its
`textContent` and add it to our string.

`serialize` in our test now reads

```
-Todo One
-Todo Two
```

Next, let's add a new child node for the checkbox, and serialize it as well.

```javascript
        todo: {
          ...
          children: {
            checkbox: {
              findValue: 'checkbox',
              serialize: val => (val.checked ? '☑️' : '◻️'),
            },
          },
        },
```

Everything here should look pretty straightforward at this point. We're using a
test ID to target the checkbox and then serializing it. One thing worth nothing
however, is that Emoji are a great option for serializers. They quickly convey
information and are handled correctly by the jest snapshot pipeline.

If we were to run our test, nothing will have changed in our serializer, because
again, the `todo` node isn't actually doing anything with serialized checkbox.
Let's use `checkboxString` in the `todo` serializer to fix that.

```javascript
        todo: {
          ...
          serialize: (val, { checkboxString }) => {
              return `-${checkboxString} ${val.textContent}$`
          },
          ...
        }
}
```

And now the serializer reads

```
-◻️ Todo One
-◻️ Todo Two
```

## Source Code

### testRender.js

```javascript
import {getRender} from 'react-wiring-library'

const wiring = {
  children: {
    todoList: {
      findValue: 'todo-list',
      serialize: (val, {todoStrings, combine}) => combine(...todoStrings),
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

export default getRender(wiring)
```

## Next Steps

That's pretty much it for the serializer. We have an easily readable snapshot
that will work great for our tests. Now, all we have to do is actually interact
with the component and use our new snapshots to confirm our component is
behaving correctly.
