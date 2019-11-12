---
id: find-child
title: findChild
sidebar_label: findChild
hide_title: true
---

# `findChild({ index, filter })`

`findChild` refers to the async function that queries for the child of a wiring node.  The actual function name is a combination of `find` and the capitialized version of the key you used to store the child. 

#### Arguments
1. `findInput` (Object)
   1. `index` (integer) If querying for an `isMultiple` wiring node, the index in the array of found elements to return. 
   2. `filter` (function). If querying for an `isMultiple` wiring node, a function that will filter all returned elements down to just the one you want.  For convenience, `testId` is also passed as an argument to `filter`. 

#### Returns
1. `functions` (Object)
   1. `child` (element) The found child element.  The actual name of the returned variable will the wiring key.  These are the objects to snapshot. 
   2. Find children functions (function) The find functions for any children
   3. Default interaction functions

Example Wiring: 
```javascript
const exampleWiring = {
  children: {
    homer: {
      findValue: 'homer',
      children: {
        bart: {
          findValue: 'bart',
        },
      },
    },
  },
}
```

Example Test Code: 
```
const {findHomer} = render(component)
const {findBart, homer} = await findHomer()
expect(homer).toMatchSnapshot('on initial render')
const {click} = await findBart()
```


#### Finding Multiple Children


Example Wiring: 
```javascript
const exampleWiring = {
  children: {
    table: {
      findValue: 'table',
      children: {
        row: {
          findValue: 'row',
        },
      },
    },
  },
}
```

##### Using Index

```
const {findTable} = render(component)
const {findRow} = await findTable()
const {click} = findRow({index: 0})
```

##### Using filter

```
...
const {click} = findRow({filter: row => row.textContent === 'First Row'})
```







