import {within} from 'react-testing-library'
import {getAllFunctions, defaultGlobalFunctions} from './getRenderHandler'

export const combine = (...strings) => {
  return strings.filter(string => string !== undefined).join('\n')
}

export const addAllCustomFunctions = (val, customFunctions, customQueries) => {
  const returnedFromWithin = within(val)
  const {
    global: getGlobalFunctions = () => ({}),
    withinElement: getWithinElementFunctions = functions => functions,
  } = customFunctions
  const globalFunctions = getGlobalFunctions({
    ...returnedFromWithin,
    ...defaultGlobalFunctions,
  })
  return getAllFunctions(
    {
      ...returnedFromWithin,
      container: val,
    },
    {...defaultGlobalFunctions, ...globalFunctions},
    getWithinElementFunctions,
    customQueries,
  )
}
