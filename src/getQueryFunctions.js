import {buildQueries, waitForElement, wait} from '@testing-library/react'

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

const getCustomQueryFunctions = ({element, queryMap}) => {
  const customQueries = Object.keys(queryMap).reduce((memo, type) => {
    const func = queryMap[type]
    return {
      ...memo,
      ...getQueriesFromFunction(func, type),
    }
  }, {})
  return Object.keys(customQueries).reduce(
    (wrapped, queryName) => ({
      ...wrapped,
      [queryName]: (...args) => customQueries[queryName](element, ...args), // eslint-disable-line import/namespace
    }),
    {},
  )
}

const getExtraQueryFunctionsForAllTypes = ({
  renderFunctions,
  customQueryFunctions,
  globalFunctions,
  queryMap,
}) => {
  const baseTypes = [
    'Text',
    'TestId',
    'AltText',
    'PlaceholderText',
    ...Object.keys(queryMap),
  ]

  const {clickElement} = globalFunctions

  const allFunctions = {
    ...renderFunctions,
    ...customQueryFunctions,
  }

  return baseTypes.reduce((memo, typeName) => {
    const buildFunctions = ({getByType, queryByType}) => {
      const waitForType = input => waitForElement(() => getByType(input))
      const clickType = input => clickElement(getByType(input))
      const makeSureTypeIsGone = input => queryByType(input) === null
      const waitForTypeAndClick = async input => {
        const element = await waitForType(input)
        clickElement(element)
        return element
      }

      const eliminateByType = input => {
        return wait(() => {
          if (!makeSureTypeIsGone(input)) {
            throw Error(
              `${typeName} ${input} is still found in the dom ` +
                'it was supposed to be removed ',
            )
          }
        })
      }

      return {
        [`eliminateBy${typeName}`]: eliminateByType,
        [`click${typeName}`]: clickType,
        [`findBy${typeName}AndClick`]: waitForTypeAndClick,
      }
    }

    return {
      ...memo,
      ...buildFunctions({
        getByType: allFunctions[`getBy${typeName}`],
        queryByType: allFunctions[`queryBy${typeName}`],
      }),
    }
  }, {})
}

const getQueryFunctions = ({
  element,
  queryMap = {},
  renderFunctions,
  globalFunctions,
}) => {
  const customQueryFunctions = getCustomQueryFunctions({
    element,
    queryMap,
  })

  const extraQueryFunctionsForAllTypes = getExtraQueryFunctionsForAllTypes({
    queryMap,
    renderFunctions,
    customQueryFunctions,
    globalFunctions,
  })
  return {
    ...customQueryFunctions,
    ...extraQueryFunctionsForAllTypes,
  }
}

export default getQueryFunctions
