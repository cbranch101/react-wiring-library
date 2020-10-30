import * as baseRootFunctions from '@testing-library/react'
import {getGlobalFunctions, getQueryFunctions} from './functionHelpers'

const {
  wait,
  within,
  render: defaultRender,
  fireEvent,
  waitForDomChange,
} = baseRootFunctions

export const getAllFunctions = (
  baseFunctions,
  globalFunctions,
  getWithinElementCustomFunctions,
  customQueries,
) => {
  const {container, baseElement = document.body} = baseFunctions
  const testId = container && container.getAttribute('data-testid')
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
  const {debug, getByTestId} = funcs

  const getTextContent = id => getByTestId(id).textContent

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

  const withinBaseElement = () => wrappedWithin(baseElement)

  const newFunctions = {
    ...funcs,
    testId,
    getTextContent,
    getTextContents: testIds => testIds.map(getTextContent),
    fireEvent,
    withinBaseElement,
    wait,
    within: wrappedWithin,
    waitForDomChange,
    ...globalFunctions,
  }
  const withinElementFunctions = getWithinElementCustomFunctions(newFunctions)
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
