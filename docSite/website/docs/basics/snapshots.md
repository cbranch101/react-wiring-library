---
id: snapshots
title: Building Readable Snapshots
sidebar_label: Building Readable Snapshots
hide_title: true
---



# Building Readable Snapshots
With the outline of the wiring structure in place, and working in a test, let's go about turning our basic static string into a representation of TodoList that's simple enough to parse quickly, but detailed enough to capture all of the ways our tests could go wrong

First, let's just review the component in question

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
A good way to work through adding serializers is to start from the top, and work your way down, adding more detail as you go.  The next level below `TodoList` is `Todo`, so let's set up wiring for that next. 

`Todo` intoduces a new wrinkle we haven't encountered yet, which is a dom element that exists in the dom multiple times at once(in this case a list).  This is what a "multiple" wiring node looks like. 

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

It's worth noting that `findType: testId` is no longer being provided here, because it's the default. 

Because `todo` is part of a list and is in the dom multiple times, we need to pass `isMultiple` so `react-wiring-library` knows how to handle it correctly.  

A few different parts of the wiring system will be aware of this change down the road, but for now it's enough to remeber to pass `isMultiple` if the `findValue` you're querying for can be in the dom multiple times at once. 

Let's quickly rerun the test to see what it did to the value being logged when we call `serialize`

```
TodoList
```

Nothing has changed.  This is because the `todoList` wiring just always returns the same string.  To display something useful, `todoList` needs to do something with the values being returned by its children. 

## Combining Todos into TodoList
Let's make the serialize in `todoList` a little bit more robust.  The first two arguments passed to `serialize` are the dom element being serialized(in this case, the TodoList), followed by an object of containing all of the serialized strings for all of this node's children(along with some useful helper functions).  All we need to do is get the child strings and combine them together. 

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

Before serialize is called for any wiring node, all of its children are serialized, and all of their values are passed into the parent serialize function as a string called `${nodeKey}String` for a standard node or an array of of strings called `${nodeKey}Strings` for an `isMultiple` node. 

In this case, we're just taking an array of `todoStrings` (which all are `-Todo`)and combining them together with new line characters to make a list. 

>In general, when combining together multiple elements in serializers, try to have them on multiple lines instead of on a single line.  When a test fails the diff that jest displays for the snapshot is MUCH more readable when values are on separate lines

After this change, serialize shows

```
-TodoList
-TodoList
```

## The Combine Helper
This kind of operation of where we take multiple strings from children and combine them together, separated by new lines in the parent happens very frequently.  For that reason, serialize gets passed a helper called `combine` for just such a task.  Let's use that here to clean up our serialize a little bit. 

```javascript
    ...
    todoList: {
      ...
      serialize: (val, {todoStrings}) => combine(...todoStrings),
      ...
    }
```

Combine takes an argument list of strings, with the list being separated by new lines.  If undefined is passed for an argument, no new line will be added.

## Fully serialize Todo

With the list in place, let's make Todo use the actual content rendered to the dom. 

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

`val` in this case is the dom node for the todo, so we're able to just get its `textContent` and serialize that. 

`serialize` in our test now reads
```
-Todo One
-Todo Two
```

Next, let's add a new child node for the checkbox, and serialize it

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

Everything here should look pretty standard at this point.  We're using a test ID to target the checkbox, and then using the provided dom element to serialize it so we can tell when the checkbox is checked.  One thing worth nothing however, is that emoji are your friend when writing serializers.  They convey a lot of information quickly and are handled correctly by the entire jest snapshot pipeline. 

As you're probably guessing at this point, if we were to run our test again, nothing will have changed in our serializer, because again, `todo` isn't actually doing anything with `checkbox`.  Let's combine `checkbox` into `todo` to fix that. 

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
          serialize: (val, { checkBoxString }) => {
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
That's pretty much it for the serializer.  We have an easily readable snapshot that will work great for our tests.  Now, all we have to do is actually interact with the component and use our new snapshots to assert that the correct things are happening. 




















