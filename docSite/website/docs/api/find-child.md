---
id: find-child
title: find{childNode}
sidebar_label: find{childNode}
hide_title: true
---

# `find{childNode}`
`({ index, filter }) => ({ element, ...find{grandChildNode}, ...elementHelpers })`

Refers to the async function that queries for the child of a wiring node.  The actual function name is a combination of `find` and the capitialized version of the key you used to store the child. 

## Arguments
1. `index` (Integer) If querying for an `isMultiple` wiring node, the index in the array of found elements to return. 
2. `filter` (Function) If querying for an `isMultiple` wiring node, a function that will filter all returned elements down to just the one you want.  For convenience, `testId` is also passed as an argument to `filter`. 

## Returns
1. `element` (DOM element) The found child element.  The actual name of the returned variable will the wiring key.  These are the objects to snapshot. 
2. `...find{grandChildNode}` (Function) this refers to the set of `find{childNode}` helpers for the next level down. The actual names of these functions are defined by their wiring keys.
3. `...elementHelpers` (Function) Any functions returned by the extend of this wiring node, in addition to any built in helpers `click`, `typeInto` etc.


## Example
### Wiring 
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

### Test
```
const {findHomer} = render(component)
const {findBart, homer} = await findHomer()
expect(homer).toMatchSnapshot('on initial render')
const {click} = await findBart()
```

## Notes

### Finding Multiple Children

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

#### Using Index

```
const {findTable} = render(component)
const {findRow} = await findTable()
const {click} = findRow({index: 0})
```

#### Using filter

```
...
const {click} = findRow({filter: row => row.textContent === 'First Row'})
```







