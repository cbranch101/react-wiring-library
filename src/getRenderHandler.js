import * as baseRootFunctions from '@testing-library/react'
import getWiringFunctions from './getWiringFunctions'
import getQueryFunctions from './getQueryFunctions'
import getWithinElementFunctions from './getWithinElementFunctions'

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
    getCustomFunctions: getWithinElementCustomFunctions,
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
  getWithinElementCustomFunctions,
  globalFunctions,
  wiringChildren,
  extend,
}) => (...args) => {
  const renderFunctions = render(...args)
  const {baseElement} = renderFunctions

  return getWiringFunctions({
    wiringChildren,
    renderFunctions,
    baseElement,
    extend,
    element: renderFunctions.container,
    getAllWithinElementFunctions: ({
      renderFunctions: currentRenderFunctions,
      element,
    }) => {
      const queryFunctions = getQueryFunctions({
        element,
        queryMap: customQueries,
        globalFunctions,
        renderFunctions: currentRenderFunctions,
      })

      const withinElementFunctions = getWithinElementFunctions({
        element,
        getCustomFunctions: getWithinElementCustomFunctions,
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
