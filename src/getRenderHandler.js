import * as baseRootFunctions from '@testing-library/react'
import {
  getGlobalFunctions,
  getQueryFunctions,
  getWithinElementFunctions,
} from './functionHelpers'

const {within, render: defaultRender} = baseRootFunctions

export const getAllFunctions = (
  baseFunctions,
  globalFunctions,
  getWithinElementCustomFunctions,
  customQueries,
) => {
  const {container, baseElement = document.body} = baseFunctions
  const queryFunctions = getQueryFunctions({
    element: container,
    queryMap: customQueries,
    globalFunctions,
    returnedFunctions: baseFunctions,
  })

  const funcs = {
    ...baseFunctions,
    ...queryFunctions,
  }
  const {debug} = funcs

  const wrappedWithin = element => {
    const returnFromWithin = within(element)
    return getAllFunctions(
      {
        ...returnFromWithin,
        container: element,
        baseElement,
        debug,
      },
      globalFunctions,
      getWithinElementCustomFunctions,
      customQueries,
    )
  }

  const newFunctions = {
    ...funcs,
    ...globalFunctions,
  }
  const withinElementFunctions = getWithinElementFunctions({
    element: container,
    getCustomWithinElementFunctions: getWithinElementCustomFunctions,
    renderFunctions: {
      ...baseFunctions,
      within: wrappedWithin,
    },
    queryFunctions,
    globalFunctions,
  })
  return {
    ...newFunctions,
    ...withinElementFunctions,
  }
}

export default ({
  render = defaultRender,
  customQueries,
  customFunctions: {
    global: getCustomGlobalFunctions,
    withinElement: getWithinElementCustomFunctions,
  },
}) => (...args) => {
  const baseFunctions = render(...args)

  const globalFunctions = getGlobalFunctions({
    returnedFunctions: baseFunctions,
    getCustomGlobalFunctions,
    baseElement: baseFunctions.baseElement,
  })

  return getAllFunctions(
    baseFunctions,
    globalFunctions,
    getWithinElementCustomFunctions,
    customQueries,
  )
}
