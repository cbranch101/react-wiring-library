import * as baseRootFunctions from '@testing-library/react'
import {
  getGlobalFunctions,
  getQueryFunctions,
  getWithinElementFunctions,
  getWiringFunctions,
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
    renderFunctions: baseFunctions,
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
  wiringChildren,
  extend,
}) => (...args) => {
  const renderFunctions = render(...args)
  const {baseElement} = renderFunctions

  const globalFunctions = getGlobalFunctions({
    renderFunctions,
    getCustomGlobalFunctions,
    baseElement,
  })
  return getWiringFunctions({
    wiringChildren,
    renderFunctions,
    extend,
    getAllWithinElementFunctions: ({
      renderFunctions: currentRenderFunctions,
    }) => {
      const {container} = currentRenderFunctions
      const queryFunctions = getQueryFunctions({
        element: container,
        queryMap: customQueries,
        globalFunctions,
        renderFunctions: currentRenderFunctions,
      })

      const withinElementFunctions = getWithinElementFunctions({
        element: container,
        getCustomWithinElementFunctions: getWithinElementCustomFunctions,
        renderFunctions: currentRenderFunctions,
        queryFunctions,
        globalFunctions,
      })

      return {
        ...currentRenderFunctions,
        ...globalFunctions,
        ...queryFunctions,
        ...withinElementFunctions,
      }
    },
  })
}
