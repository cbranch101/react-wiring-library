import * as baseRootFunctions from '@testing-library/react'
import getWiringFunctions from './getWiringFunctions'
import getQueryFunctions from './getQueryFunctions'
import getWithinElementFunctions from './getWithinElementFunctions'

const {render: defaultRender} = baseRootFunctions

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
