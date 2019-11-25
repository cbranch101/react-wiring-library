---
id: abstract-wiring-node
title: Abstract Wiring Node
sidebar_label: Abstract Wiring Node
hide_title: true
---

# Abstract Wiring Node

For the vast majority of use cases, standard wiring nodes work great.  For certain situations however, a new kind of node is required.  Abstract wiring nodes become useful when you need to include a single abstract node in your wiring tree that is able to behave differently depending in different situations.  To create an abstract wiring node, you need to add both `types` and `getCurrentType` to a standard wiring node. 

## `types` (Object) 
An object where they key is the type name that will be returned from `getCurrentType` and the object is a type node.  

```javascript
types: {
  buttonItem: {
    extend: (val, {findButton}) => ({
      clickButton: async () => {
        const {click} = await findButton()
        click()
      },
    }),
    serialize: (val, {buttonString}, baseString) => {
      return `${baseString} ${buttonString}`
    },
    children: {
      button: {
        serialize: val => `[${val.textContent}]`,
      },
    },
  }
```

## `getCurrentType`
`(element, { ...elementHelpers }) => currentTypeString` 

A function that takes an element, and any required helper functions, and returns the string that points to the type that should currently be used for this node

```javascript
getCurrentType: (val, {queryByTestId}) => {
  if (queryByTestId('button')) {
    return 'buttonItem'
  }
  return 'checkboxItem'
}
```

## Type Options

The general idea of options declared in a type is that they are supposed to augment the functions declared in the base type.  

### `extend`
`(element, { ...elementHelpers }) => ({ ...newElementHelpers })` 

`extend` in a type behaves the same way as a standard `extend`, except that instead of just returning new functions, it returns functions that will be added to any functions returned from the base extend. That means if you return `funcA` from the base node, and return `funcB` from the type, both `funcA` and `funcB` will be available in the test.  Additionally, `funcA` will be available in the type `extend`

### `serialize`
`(element, { ...elementHelpers }, baseString) => serializedString`

When `serialize` is run an in abstract element, the serialize in the base node runs, and then the serialized string is passed as the third argument to the `serialize` function of all of the types, so those types can add any additonal customizations they need. It should be noted that you don't necessarily have to return only a string from the base node, you could also return a function that allows for more complicated interactions in the types. 

### `children` (Object)

Similar to `extend` and `serialize` the `children` object in a type adds on to the `children` object of the base type.  This allows you add new children that only exist for that type, while being able to declare child in the base type that you know will existing for all types. 


Example Dom:

```html
<ul data-testid="list">
    <li data-testid="item">
        <span data-testid="name">Row One</span>
        <button data-testid="button">Button Name</button>
    </li>
    <li data-testid="item">
        <span data-testid="name">Row One</span>
        <input data-testid="checkbox" type="checkbox"/>
    </li>
</ul>
```

Example Wiring:
```javascript
const abstractWiring = {
  children: {
    list: {
      findValue: 'list',
      serialize: (val, {itemStrings, combine}) => combine(...itemStrings),
      children: {
        item: {
          serialize: (val, {nameString}) => `-${nameString}`,
          isMultiple: true,
          findValue: 'item',
          children: {
            name: {
              findValue: 'name',
              serialize: val => val.textContent,
            },
          },
          getCurrentType: (val, {queryByTestId}) => {
            if (queryByTestId('button')) {
              return 'buttonItem'
            }
            return 'checkboxItem'
          },
          types: {
            buttonItem: {
              extend: (val, {findButton}) => ({
                clickButton: async () => {
                  const {click} = await findButton()
                  click()
                },
              }),
              serialize: (val, {buttonString}, baseString) => {
                return `${baseString} ${buttonString}`
              },
              children: {
                button: {
                  serialize: val => `[${val.textContent}]`,
                },
              },
            },
            checkItem: {
              extend: (val, {findCheckbox}) => ({
                toggleCheckbox: async () => {
                  const {click} = await findCheckbox()
                  click()
                },
              }),
              serialize: (val, {checkbox}, baseString) => {
                return `${baseString} ${buttonString}`
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
    },
  },
}
```

Example Test: 
```javascript
{
  children: {
    list: {
      findValue: 'list',
      serialize: (val, {itemStrings, combine}) => combine(...itemStrings),
      children: {
        item: {
          serialize: (val, {nameString}) => `-${nameString}`,
          isMultiple: true,
          findValue: 'item',
          children: {
            name: {
              findValue: 'name',
              serialize: val => val.textContent,
            },
          },
          getCurrentType: (val, {queryByTestId}) => {
            if (queryByTestId('button')) {
              return 'buttonItem'
            }
            return 'checkboxItem'
          },
          types: {
            buttonItem: {
              extend: (val, {findButton}) => ({
                clickButton: async () => {
                  const {click} = await findButton()
                  click()
                },
              }),
              serialize: (val, {buttonString}, baseString) => {
                return `${baseString} ${buttonString}`
              },
              children: {
                button: {
                  serialize: val => `[${val.textContent}]`,
                },
              },
            },
            checkItem: {
              extend: (val, {findCheckbox}) => ({
                toggleCheckbox: async () => {
                  const {click} = await findCheckbox()
                  click()
                },
              }),
              serialize: (val, {checkboxString}, baseString) => {
                return `${baseString} ${checkboxString}`
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
    },
  },
}
```

Example Test: 
```javascript
  const {findList} = render(component)
  const {findItem, list} = await findList()
  // - Row One [Button Nane]
  // - Row Two ◻️
  expect(list).toMatchSnapshot('on initial render')
  const {clickButton} = await findItem({index: 0})
  await clickButton()
  const {toggleCheckbox} = await findItem({index: 1})
  await toggleCheckbox()
  // - Row One [Button Nane]
  // - Row Two ☑️
  expect(list).toMatchSnapshot('after toggling checkbox')
```

