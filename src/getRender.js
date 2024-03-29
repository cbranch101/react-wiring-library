import * as defaultLibrary from '@testing-library/react'
import getGlobalFunctions from './getGlobalFunctions'
import serializeElement from './serializeElement'
import {matchesTestId} from './helpers'
import getTestFunctions from './getTestFunctions'
import getEngine from './getEngine'

const getRender = (wiring, config = {}) => {
  const {
    customFunctions = {},
    customQueries: customQueryMap = {},
    render: customRender,
    engine: engineInput = {
      type: 'react',
      library: defaultLibrary,
    },
  } = config

  const engine = getEngine(engineInput)

  const {blockSerialize} = engine

  const {
    global: getCustomGlobalFunctions = () => ({}),
    withinElement: getWithinElementCustomFunctions = () => ({}),
  } = customFunctions
  const {children, extend} = wiring

  const renderTest = customRender || engine.render

  const globalFunctions = getGlobalFunctions(engine)({
    getCustomGlobalFunctions,
    getWithinElementCustomFunctions,
    customQueryMap,
    rootChildren: children,
  })

  if (!blockSerialize) {
    Object.keys(wiring.children).forEach((key) => {
      expect.addSnapshotSerializer({
        test: (val) => matchesTestId(val, wiring.children[key].findValue),
        print: (val) => {
          return serializeElement(engine)({
            wiringItem: wiring.children[key],
            element: val,
            getWithinElementCustomFunctions,
            customQueryMap,
            globalFunctions,
          })
        },
      })
    })
  }

  return (...args) => {
    const renderFunctions = renderTest(...args)
    return getTestFunctions(engine)({
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
