import {within} from 'react-testing-library'
import {getAllFunctions} from './getRenderHandler'

export const combine = (...strings) => {
  return strings.filter(string => string !== undefined).join('\n')
}

export const isButtonDisabled = button => button.parentNode.disabled

export const addAllCustomFunctions = (val, customFunctions = {}) => {
  const returnedFromWithin = within(val)
  const {
    global: getGlobalFunctions = () => ({}),
    withinElement: getWithinElementFunctions = functions => functions,
  } = customFunctions
  const globalFunctions = getGlobalFunctions()
  return getAllFunctions(
    {
      ...returnedFromWithin,
      container: val,
    },
    globalFunctions,
    getWithinElementFunctions,
  )
}
