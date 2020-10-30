const getDefaultGlobalFunctions = ({renderFunctions, baseElement}) => ({
  withinBaseElement: () => within(baseElement),
})

const getGlobalFunctions = ({
  getCustomGlobalFunctions,
  renderFunctions,
  baseElement,
}) => {
  const defaultGlobalFunctions = getDefaultGlobalFunctions({
    renderFunctions,
    baseElement,
  })
  const customGlobalFunctions = getCustomGlobalFunctions({
    ...defaultGlobalFunctions,
    renderFunctions,
  })
  return {
    ...defaultGlobalFunctions,
    ...customGlobalFunctions,
  }
}

const getQueryFunction = ({
  isMultiple,
  withinBaseElement,
  queryFunctions,
  queryType,
  isInBase,
  targetType,
}) => {
  const currentFunctions = isInBase ? withinBaseElement() : queryFunctions
  const fullTargetType = uppercaseFirstLetter(targetType)
  const findOne = `${queryType}By${fullTargetType}`
  const findMany = `${queryType}AllBy${fullTargetType}`
  const findName = isMultiple ? findMany : findOne
  return currentFunctions[findName]
}

const getWiringWithTypesApplied = ({parent, wiringNode, functionsToPass}) => {}

const serializeElement = ({
  element,
  wiringNode,
  queryMap,
  getCustomGlobalFunctions,
  getCustomWithinElementFunctions,
}) => {
  const returnedFunctions = within(element)
  const queryFunctions = getQueryFunctions({
    element,
    queryMap,
  })
  const globalFunctions = getGlobalFunctions({
    getCustomGlobalFunctions,
    returnedFunctions,
    baseElement: document.body,
  })

  const customWithinElementFunctions = getCustomWithinElementFunctions({
    ...returnedFunctions,
    ...queryFunctions,
    ...globalFunctions,
  })

  const {children, serialize, extend} = getWiringWithTypesApplied({
    parent: element,
    wiringNode,
    functionsToPass: {
      ...globalFunctions,
      ...queryFunctions,
      ...returnedFunctions,
      ...customWithinElementFunctions,
    },
  })

  if (children) {
    serializedChildren = Object.keys(children).reduce((memo, childName) => {
      const child = children[childName]
      const {
        findValue,
        findType = 'testId',
        isMultiple,
        shouldFindInBaseElement,
      } = child
      const query = getQueryFunction({
        queryFunctions,
        withinBaseElement: globalFunctions.withinBaseElement,
        isInBase: shouldFindInBaseElement,
        targetType: uppercaseFirstLetter(findType),
        isMultiple,
        queryType: 'query',
      })
      const childElement = query()
    }, {})
  }
  return serialize(element, {
    ...returnedFunctions,
    ...globalFunctions,
    ...customWithinElementFunctions,
  })
}

const getQueryFunctions = ({element, queryMap, returnedFunctions}) => {
  const getCustomQueryFunctions = () => {
    // use queryMap and element to create new custom queries
    // from query map and then wrap them around the element
  }
  const customQueryFunctions = getCustomQueryFunctions()
  const baseQueryFunctions = {
    ...returnedFunctions,
    ...customQueryFunctions,
  }

  const getExtraQueryFunctionsForAllTypes = () => {
    // use baseQueryFunctions to populate all of the extra functions
    // required for every type
  }

  const extraQueryFunctionsForAllTypes = getExtraQueryFunctionsForAllTypes()
  return {
    ...baseQueryFunctions,
    ...extraQueryFunctionsForAllTypes,
  }
}

const getWiringFunctions = ({
  wiringChildren,
  queryMap,
  queryFunctions,
  returnedFunctions,
  globalFunctions,
  getCustomWithinElementFunctions,
}) => {
  const updatedFunctions = Object.keys(wiringChildren).reduce(
    (memo, childName) => {
      const findName = `find${uppercaseFirstLetter(childName)}`
      const find = async (findArgs = {}) => {
        const wiring = wiringChildren[childName]
        const {
          findValue,
          findType = 'testId',
          isMultiple,
          shouldFindInBaseElement,
        } = wiring
        const {index, filter} = findArgs
        const performFind = async () => {
          const query = getQueryFunction({
            queryFunctions,
            withinBaseElement: globalFunctions.withinBaseElement,
            isInBase: shouldFindInBaseElement,
            targetType: uppercaseFirstLetter(findType),
            targetValue: findValue,
            isMultiple,
            queryType: 'find',
          })
          const element = await performFind()

          const returnedFromChildFunctions = within(element)
          const {children, extend} = getWiringWithTypesApplied(
            element,
            wiring,
            {},
          )

          const childQueryFunctions = getQueryFunctions({
            returnedFunctions,
            queryMap,
            element,
          })

          const customWithinElementFunctions = getCustomWithinElementFunctions({
            ...childQueryFunctions,
            ...globalFunctions,
            ...returnedFromChildFunctions,
          })
          const wiringFunctions = getWiringFunctions({
            wiringChildren: children,
            queryMap,
            queryFunctions: childQueryFunctions,
            globalFunctions,
            getCustomWithinElementFunctions,
          })

          const extendedFunctions = extend(element, {
            ...globalFunctions,
            ...queryFunctions,
            ...wiringFunctions,
            ...customWithinElementFunctions,
          })
          return {
            ...childQueryFunctions,
            ...wiringFunctions,
            ...globalFunctions,
            ...customWithinElementFunctions,
            ...extendedFunctions,
          }
        }
        return {
          ...memo,
          [findName]: find,
        }
      }
    },
    {},
  )
}

const getRender = (wiringMap, options) => {
  const {render, customFunctions, queryMap} = options
  const {
    withinElement: getCustomWithinElementFunctions,
    global: getCustomGlobalFunctions,
  } = customFunctions
  return (...args) => {
    const returnedFunctions = render(...args)
    const {baseElement, container: element} = returnedFunctions
    const globalFunctions = getGlobalFunctions({
      returnedFunctions,
      baseElement,
      getCustomGlobalFunctions,
    })
    const queryFunctions = getQueryFunctions({
      returnedFunctions,
      queryMap,
      element,
    })

    const wiringFunctions = getWiringFunctions({
      wiringChildren: wiringMap,
      queryMap,
      returnedFunctions,
      queryFunctions,
      globalFunctions,
      getCustomWithinElementFunctions,
    })
    return {
      ...returnedFunctions,
      ...globalFunctions,
      ...queryFunctions,
      ...wiringFunctions,
    }
  }
}
