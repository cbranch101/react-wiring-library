import {
  within,
  fireEvent,
  waitForDomChange,
  buildQueries,
  waitForElement,
  wait,
} from '@testing-library/react'

const getDefaultGlobalFunctions = ({baseElement}) => ({
  withinBaseElement: () => within(baseElement),
  fireEvent,
  wait,
  clickElement: element => fireEvent.click(element),
  typeIntoElement: (text, element) => {
    fireEvent.change(element, {target: {value: text}})
  },
  focusElement: element => {
    fireEvent.focus(element)
  },
  blurElement: element => {
    fireEvent.blur(element)
  },
  waitForDomChange,
})

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
  returnedFunctions,
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
    ...returnedFunctions,
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

export const getQueryFunctions = ({
  element,
  queryMap = {},
  returnedFunctions,
  globalFunctions,
}) => {
  const customQueryFunctions = getCustomQueryFunctions({
    element,
    queryMap,
  })

  const extraQueryFunctionsForAllTypes = getExtraQueryFunctionsForAllTypes({
    queryMap,
    returnedFunctions,
    customQueryFunctions,
    globalFunctions,
  })
  return {
    ...customQueryFunctions,
    ...extraQueryFunctionsForAllTypes,
  }
}

export const getGlobalFunctions = ({
  getCustomGlobalFunctions,
  renderFunctions,
  baseElement,
}) => {
  const defaultGlobalFunctions = getDefaultGlobalFunctions({
    baseElement,
  })

  const customGlobalFunctions = getCustomGlobalFunctions({
    ...defaultGlobalFunctions,
    ...renderFunctions,
    baseElement,
  })
  return {
    ...defaultGlobalFunctions,
    ...customGlobalFunctions,
  }
}

const getDefaultWithinElementFunctions = ({
  element,
  renderFunctions,
  globalFunctions,
}) => {
  const {getByTestId, within} = renderFunctions

  const {
    clickElement,
    focusElement,
    blurElement,
    typeIntoElement,
  } = globalFunctions
  const getTextContent = id => getByTestId(id).textContent
  const testId = element && element.getAttribute('data-testid')
  return {
    testId,
    getTextContent,
    within,
    getTextContents: testIds => testIds.map(getTextContent),
    click: () => clickElement(element),
    focus: () => focusElement(element),
    typeInto: text => typeIntoElement(text, element),
    blur: () => blurElement(element),
  }
}

export const uppercaseFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const getQueryFunction = ({
  isMultiple,
  functions,
  queryType,
  isInBase,
  targetType,
}) => {
  const {withinBaseElement} = functions
  const currentFunctions = isInBase ? withinBaseElement() : functions
  const fullTargetType = uppercaseFirstLetter(targetType)
  const findOne = `${queryType}By${fullTargetType}`
  const findMany = `${queryType}AllBy${fullTargetType}`
  const findName = isMultiple ? findMany : findOne
  return currentFunctions[findName]
}

export const getWiringWithTypesApplied = (parent, wiring, functions) => {
  const {
    getCurrentType,
    types,
    extend = () => ({}),
    children,
    serialize = () => {},
  } = wiring
  if (!getCurrentType || !types) {
    return {...wiring, extend, serialize}
  }
  const type = getCurrentType(parent, functions)
  if (!type) {
    return {...wiring, extend, serialize}
  }
  const {
    types: typesForType,
    getCurrentType: getCurrentTypeForType,
    extend: extendForType,
    children: childrenForType,
    serialize: serializeForType,
  } = types[type]
  const applyTypeToExtend = () => {
    if (!extendForType) {
      return extend
    }

    return (val, functions) => {
      const extendedFunctions = extend(val, functions)
      const functionsForType = extendForType(val, {
        ...functions,
        ...extendedFunctions,
      })
      return {
        ...extendedFunctions,
        ...functionsForType,
      }
    }
  }

  const applyTypeToChildren = () => {
    if (!childrenForType) {
      return children
    }
    return {
      ...(children || {}),
      ...childrenForType,
    }
  }

  const applyTypeToSerialize = () => {
    if (!serializeForType) {
      return serialize
    }
    return (val, functions) => {
      const baseString = serialize(val, functions)
      return serializeForType(val, functions, baseString)
    }
  }

  const updatedWiring = {
    ...wiring,
    extend: applyTypeToExtend(),
    children: applyTypeToChildren(),
    serialize: applyTypeToSerialize(),
  }

  if (!typesForType || !getCurrentTypeForType) {
    return updatedWiring
  }

  return getWiringWithTypesApplied(
    parent,
    {
      ...updatedWiring,
      types: typesForType,
      getCurrentType: getCurrentTypeForType,
    },
    functions,
  )
}

export const getWiringFunctions = ({
  wiringChildren,
  renderFunctions,
  extend = () => ({}),
  getAllWithinElementFunctions,
}) => {
  const functions = getAllWithinElementFunctions({
    renderFunctions,
  })
  const wiringFunctions = Object.keys(wiringChildren).reduce(
    (memo, childName) => {
      const findName = `find${uppercaseFirstLetter(childName)}`
      const find = async (findArgs = {}) => {
        const wiringChild = wiringChildren[childName]
        const {
          findValue,
          findType = 'testId',
          isMultiple,
          shouldFindInBaseElement,
        } = wiringChild
        const {index, filter} = findArgs
        const performFind = async () => {
          const query = getQueryFunction({
            functions,
            isInBase: shouldFindInBaseElement,
            targetType: uppercaseFirstLetter(findType),
            targetValue: findValue,
            isMultiple,
            queryType: 'find',
          })
          const found = await query(findValue)
          const foundElements = isMultiple ? found : [found]
          if (!isMultiple) {
            return foundElements[0]
          }
          if (index !== undefined) {
            const element = foundElements[index]
            if (!element) {
              throw new Error(
                `You tried to find index ${index} in ${findName} but ${foundElements.length} is the highest index`,
              )
            }
            return element
          }
          if (filter !== undefined) {
            const filteredElements = foundElements.filter(element =>
              filter(element, element.getAttribute('data-testid')),
            )

            if (filteredElements.length === 0) {
              throw new Error(
                `the filter function passed into ${findName} didn't find anything`,
              )
            }

            if (filteredElements.length > 1) {
              throw new Error(
                `the filter function passed into ${findName} returned ${foundElements.length} elements, it should only return one`,
              )
            }
            return filteredElements[0]
          }
          throw new Error(
            `You tried to call ${findName} which was set as isMultiple, without providing either an index, or a filter function`,
          )
        }
        const element = await performFind()

        const returned = within(element)

        const returnedFromWithin = {
          ...returned,
          container: element,
        }

        const withinElementFunctions = getAllWithinElementFunctions({
          renderFunctions: returnedFromWithin,
        })

        const functionsToReturn = {
          ...returnedFromWithin,
          ...withinElementFunctions,
        }

        const {children, extend} = getWiringWithTypesApplied(
          element,
          wiringChild,
          returnedFromWithin,
        )
        if (!children) {
          return {
            [childName]: element,
            ...functionsToReturn,
            ...extend(element, functionsToReturn),
          }
        }

        return {
          [childName]: element,
          ...getWiringFunctions({
            wiringChildren: children,
            renderFunctions: returnedFromWithin,
            extend,
            getAllWithinElementFunctions,
          }),
          ...functionsToReturn,
        }
      }
      return {
        ...memo,
        [findName]: find,
      }
    },
    {},
  )
  return {
    ...wiringFunctions,
    ...functions,
    ...extend(parent, {
      ...wiringFunctions,
      ...functions,
    }),
  }
}

export const getWithinElementFunctions = ({
  element,
  getCustomWithinElementFunctions,
  renderFunctions,
  queryFunctions,
  globalFunctions,
}) => {
  const defaultWithinElementFunctions = getDefaultWithinElementFunctions({
    element,
    renderFunctions,
    globalFunctions,
  })
  const customWithinElementFunctions = getCustomWithinElementFunctions({
    ...renderFunctions,
    ...defaultWithinElementFunctions,
    ...globalFunctions,
    ...queryFunctions,
  })
  return {
    ...defaultWithinElementFunctions,
    ...customWithinElementFunctions,
  }
}
