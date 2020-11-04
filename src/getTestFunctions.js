import getWiringFunctions from './getWiringFunctions'
import getQueryFunctions from './getQueryFunctions'
import getWithinElementFunctions from './getWithinElementFunctions'

export default ({
  renderFunctions,
  customQueryMap,
  getWithinElementCustomFunctions,
  globalFunctions,
  wiringChildren,
  extend,
}) => {
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
