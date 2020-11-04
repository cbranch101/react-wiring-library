import getRenderHandler from './getRenderHandler'
import getGlobalFunctions from './getGlobalFunctions'
import serializeElement from './serializeElement'
import {matchesTestId} from './helpers'

export const getRender = (wiring, config = {}) => {
  const {customFunctions = {}, customQueries: customQueryMap = {}} = config
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

  Object.keys(wiring.children).forEach(key => {
    expect.addSnapshotSerializer({
      test: val => matchesTestId(val, wiring.children[key].findValue),
      print: val => {
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

  return getRenderHandler({
    render: config.render,
    wiringChildren: children,
    extend,
    customQueryMap,
    getWithinElementCustomFunctions,
    globalFunctions,
  })
}
