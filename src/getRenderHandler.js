import * as baseRootFunctions from '@testing-library/react'
import {getGlobalFunctions, getQueryFunctions} from './functionHelpers'

const {
  waitForElement,
  wait,
  within,
  render: defaultRender,
  fireEvent,
  queryHelpers,
  buildQueries,
  waitForDomChange,
} = baseRootFunctions

const getQueriesFromFunction = (func, type) => {
  const getMultipleError = (c, findValue) =>
    `Found multiple elements with ${type} of ${findValue}`
  const getMissingError = (c, findValue) =>
    `Unable to find an element with ${type} of ${findValue}`

  const [queryBy, getAllBy, getBy, findAllBy, findBy] = buildQueries(
    func,
    getMultipleError,
    getMissingError,
  )

  const namedQueries = {
    queryAllBy: func,
    queryBy,
    getAllBy,
    getBy,
    findAllBy,
    findBy,
  }

  return Object.keys(namedQueries).reduce(
    (memo, queryName) => ({
      ...memo,
      [`${queryName}${type}`]: namedQueries[queryName],
    }),
    {},
  )
}

export const addCustomQueriesToFunctions = (funcs, queryMap, val) => {
  const customQueries = Object.keys(queryMap).reduce((memo, type) => {
    const func = queryMap[type]
    return {
      ...memo,
      ...getQueriesFromFunction(func, type),
    }
  }, {})
  const wrappedCustomQueries = Object.keys(customQueries).reduce(
    (wrapped, queryName) => ({
      ...wrapped,
      [queryName]: (...args) => customQueries[queryName](val, ...args), // eslint-disable-line import/namespace
    }),
    {},
  )
  return {
    ...funcs,
    ...wrappedCustomQueries,
  }
}

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
