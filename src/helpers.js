import {within} from '@testing-library/react'
import {getAllFunctions} from './getRenderHandler'
import {getGlobalFunctions} from './functionHelpers'

export const combine = (...strings) => {
  return strings.filter(string => string !== undefined).join('\n')
}

export const addAllCustomFunctions = (val, customFunctions, customQueries) => {
  const returnedFromWithin = within(val)
  const {
    global: getCustomGlobalFunctions = () => ({}),
    withinElement: getWithinElementFunctions = functions => functions,
  } = customFunctions

  const globalFunctions = getGlobalFunctions({
    returnedFunctions: returnedFromWithin,
    getCustomGlobalFunctions,
    baseElement: document.body,
  })
  return getAllFunctions(
    {
      ...returnedFromWithin,
      container: val,
    },
    globalFunctions,
    getWithinElementFunctions,
    customQueries,
  )
}
