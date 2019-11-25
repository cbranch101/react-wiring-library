---
id: get-render
title: getRender
sidebar_label: getRender
hide_title: true
---

# getRender
`(wiringTree, options) => ({ ...find{childNode}, ...globalHelpers })`

The root function for all of `react-wiring-library`. Pass in your [wiring tree](wiring-tree.md) and options and get back a render function to call in your tests. 

## Arguments
1. [`wiringTree`](wiring-tree.md) (Object) An tree shaped object that describes all of the serializers and interactions needed to test your components
2. `options` (Object) An object of conigurations that will apply to the entirety of the wiring tree

## Returns
1. [`...find{childNode}`](find-child.md) The functions to query for all of the top level children in the wiring tree.  These are the only nodes that can be serialized in tests. 
2. `...globalHelpers` All of the global helpers provided by `react-wiring-library`.

## Example
```javascript
const wiringTree = {
    ...
}
const options = {
    ...
}
const render = getRender(wiringTree, options)
const {findFirstChild} = render(component)
```

## Options

### `customQueries` (Object)
`{ TypeName: (element, ...queryArgs) => foundElement }`

Makes it possible to add all of the [query variations](https://testing-library.com/docs/dom-testing-library/api-queries) from `dom-testing-library` for a new type of query. 

```javascript
import {queryHelpers} from '@testing-library/react'
const {queryAllByAttribute} = queryHelpers
const options = {
  customQueries: {
    IconName: (element, iconName) =>
      queryAllByAttribute('xlink:href', element, iconName),
  },
}

const render = getRender(wiring, options);
const { findChild } = render(component)
const { findByIconName, findAllByIconName, queryByIconName } = await findChild()
```

### `render` (Function)
`(...renderArgs) => ({ ...returnedFromRender })`

By default, the render function that gets returned from `getRender` just calls the [`render`](https://testing-library.com/docs/react-testing-library/api#render) function from `react-testing-library` and returns its result, but if you need to set up mocks, or add custom functionality before [`render`](https://testing-library.com/docs/react-testing-library/api#render) is called, this is the place to do it. 

```javascript
import { render as baseRender } from '@testing-library/react'
import mockApi from './mockApi'

const options = {
    render: (component, apiShape) => {
        mockApi(apiShape)
        return baseRender(component)
    }
}
const render = getRender(wiringTree, options)
const apiShape = {
    // describes what your API should return
}
const { findChild } = render(<Component />, apiShape)
```

### `customFunctions` (Object)
```
{ 
    withinElement: ({ ...elementHelpers }) => ({ ...newElementHelpers },
    global: ({ ...globalHelpers }) => ({ ...newGlobalHelpers }),
}
```

This object allows you to add new helpers that will be available in every [wiring node](wiring-node.md) in your [wiring tree](wiring-tree.md). Each key in the object is a function that takes some helpers and returns new helpers that will be mixed into existing helpers of that type. The two helper types are as follows. 
1. `withinElement`. These helpers are similar to `findByTestId` or `click` in that are targeted at and work within a specific DOM element. As `react-wiring-library` traverses your wiring tree and builds out the custom functionality for each node, these functions will be rebuilt to target each element on the way down, and are only returned from [`find{childNode}`](find-child.md). 
2. `global` These helpers are just generic functions that don't need to be targeted at a specific element. Basically anything that isn't specifically targetted at an element should be global. For convenience, these are returned from both [`find{childNode}`](find-child.md) and `render`

```javascript
const options = {
    customFunctions: {
        withinElement: ({ findByTestId }) => {
            return {
                findByTestIdWithPrefix: testId =>
                    findByTestId(`test-id-${testId}`),
            }
        },
        global: () => {
            return {
                waitForMS: ms =>
                    new Promise(resolve => setTimeout(() => resolve(), ms)),
            }
        },
    },
}

const render = getRender(wiringTree, options)
const { findChild, waitForMS } = render(<Component />)
await waitForMS(100)
const { findByTestIdWithPrefix } = await findChild()
await findByTestIdWithPrefix('foo')
```




