import getRenderHandler from './getRenderHandler'
import getGlobalFunctions from './getGlobalFunctions'
import serializeElement from './serializeElement'
import {matchesTestId} from './helpers'

export const getRender = (wiring, config = {}) => {
  const {customFunctions = {}, customQueries = {}} = config
  const {
    global: getCustomGlobalFunctions = () => ({}),
    withinElement: getWithinElementCustomFunctions = () => ({}),
  } = customFunctions
  const {children, extend} = wiring

  const globalFunctions = getGlobalFunctions({
    getCustomGlobalFunctions,
    getWithinElementCustomFunctions,
    customQueries,
    rootChildren: children,
  })

  Object.keys(wiring.children).forEach(key => {
    expect.addSnapshotSerializer({
      test: val => matchesTestId(val, wiring.children[key].findValue),
      print: val => {
        return serializeElement(
          wiring.children[key],
          val,
          customFunctions,
          customQueries,
          globalFunctions,
          getWithinElementCustomFunctions,
        )
      },
    })
  })

  return getRenderHandler({
    customQueries,
    render: config.render,
    wiringChildren: children,
    extend,
    queryMap: customQueries,
    getWithinElementCustomFunctions,
    globalFunctions,
  })
}
