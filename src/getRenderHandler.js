import * as baseRootFunctions from '@testing-library/react'
import getWiringFunctions from './getWiringFunctions'
import getQueryFunctions from './getQueryFunctions'
import getWithinElementFunctions from './getWithinElementFunctions'

const {render: defaultRender} = baseRootFunctions

export default ({
  render = defaultRender,
  customQueryMap,
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
        customQueryMap,
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
