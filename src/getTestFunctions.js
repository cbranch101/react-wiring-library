import getWiringFunctions from './getWiringFunctions'
import getQueryFunctions from './getQueryFunctions'
import getWithinElementFunctions from './getWithinElementFunctions'

export default (engine) =>
  ({
    renderFunctions,
    customQueryMap,
    getWithinElementCustomFunctions,
    globalFunctions,
    wiringChildren,
    extend,
  }) => {
    const {baseElement} = renderFunctions

    return getWiringFunctions(engine)({
      wiringChildren,
      renderFunctions,
      baseElement,
      extend,
      element: renderFunctions.container,
      getAllWithinElementFunctions: ({
        renderFunctions: currentRenderFunctions,
        element,
      }) => {
        const queryFunctions = getQueryFunctions(engine)({
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
