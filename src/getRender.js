import {render as defaultRender} from '@testing-library/react'
import getGlobalFunctions from './getGlobalFunctions'
import serializeElement from './serializeElement'
import {matchesTestId} from './helpers'
import getTestFunctions from './getTestFunctions'

const getRender = (wiring, config = {}) => {
  const {
    customFunctions = {},
    customQueries: customQueryMap = {},
    render: renderTest = defaultRender,
  } = config
  const {
    global: getCustomGlobalFunctions = () => ({}),
    withinElement: getWithinElementCustomFunctions = () => ({}),
  } = customFunctions
  const {children, extend} = wiring

  const globalFunctions = getGlobalFunctions({
    getCustomGlobalFunctions,
    getWithinElementCustomFunctions,
    customQueryMap,
    rootChildren: children,
  })

  Object.keys(wiring.children).forEach((key) => {
    expect.addSnapshotSerializer({
      test: (val) => matchesTestId(val, wiring.children[key].findValue),
      print: (val) => {
        return serializeElement({
          wiringItem: wiring.children[key],
          element: val,
          getWithinElementCustomFunctions,
          customQueryMap,
          globalFunctions,
        })
      },
    })
  })

  return (...args) => {
    const renderFunctions = renderTest(...args)
    return getTestFunctions({
      wiringChildren: children,
      renderFunctions,
      extend,
      customQueryMap,
      getWithinElementCustomFunctions,
      globalFunctions,
    })
  }
}

export default getRender
