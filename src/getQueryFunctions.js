const getQueriesFromFunction = ({buildQueries}) => (func, type) => {
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

const getCustomQueryFunctions = (engine) => ({element, customQueryMap}) => {
  const customQueries = Object.keys(customQueryMap).reduce((memo, type) => {
    const func = customQueryMap[type]
    return {
      ...memo,
      ...getQueriesFromFunction(engine)(func, type),
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
  waitFor,
  waitForElementToBeRemoved,
}) => ({
  renderFunctions,
  customQueryFunctions,
  globalFunctions,
  customQueryMap,
}) => {
  const baseTypes = [
    'Text',
    'TestId',
    'AltText',
    'PlaceholderText',
    ...Object.keys(customQueryMap),
  ]

  const {clickElement} = globalFunctions

  const allFunctions = {
    ...renderFunctions,
    ...customQueryFunctions,
  }

  return baseTypes.reduce((memo, typeName) => {
    const buildFunctions = ({getByType}) => {
      const waitForType = (input) => waitFor(() => getByType(input))
      const clickType = (input) => clickElement(getByType(input))
      const waitForTypeAndClick = async (input) => {
        const element = await waitForType(input)
        clickElement(element)
        return element
      }

      const eliminateByType = (input) => {
        return waitForElementToBeRemoved(() => getByType(input))
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

const getQueryFunctions = (engine) => ({
  element,
  customQueryMap = {},
  renderFunctions,
  globalFunctions,
}) => {
  const customQueryFunctions = getCustomQueryFunctions(engine)({
    element,
    customQueryMap,
  })

  const extraQueryFunctionsForAllTypes = getExtraQueryFunctionsForAllTypes(
    engine,
  )({
    customQueryMap,
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
