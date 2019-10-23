import {addAllCustomFunctions, combine} from './helpers'
import getRenderHandler from './getRenderHandler'

const uppercaseFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1)

const getQueryFunction = ({
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

const getWiringWithTypesApplied = (parent, wiring, functions) => {
  const {getCurrentType, types, extend, children, serialize = () => {}} = wiring
  if (!getCurrentType || !types) {
    return wiring
  }
  const type = getCurrentType(parent, functions)
  if (!type) {
    return wiring
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

const serializeElement = (
  wiringItem,
  element,
  customFunctions,
  customQueries,
) => {
  if (!element) {
    return undefined
  }
  const returnedFromWithin = addAllCustomFunctions(
    element,
    customFunctions,
    customQueries,
  )

  const {children, serialize} = getWiringWithTypesApplied(
    element,
    wiringItem,
    returnedFromWithin,
  )
  let serializedChildren = {}
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
        functions: returnedFromWithin,
        isInBase: shouldFindInBaseElement,
        targetType: uppercaseFirstLetter(findType),
        isMultiple,
        queryType: 'query',
      })
      const childElements = isMultiple ? query(findValue) : [query(findValue)]
      const childStrings = childElements.map(childElement =>
        childElement
          ? serializeElement(
              child,
              childElement,
              customFunctions,
              customQueries,
            )
          : undefined,
      )
      const baseFullChildName = `${childName}String`
      const fullChildName = isMultiple
        ? `${baseFullChildName}s`
        : baseFullChildName
      return {
        ...memo,
        [fullChildName]: isMultiple ? childStrings : childStrings[0],
      }
    }, {})
  }

  return serialize(element, {
    ...returnedFromWithin,
    ...serializedChildren,
    combine,
  })
}

const getDefaultFunctions = (functions, element) => ({
  click: () => functions.clickElement(element),
})

const addExtraFunctions = (
  wiringMap,
  baseFunctions,
  extend = () => ({}),
  parent,
) => {
  const {within, clickElement} = baseFunctions
  const functions = {
    ...baseFunctions,
    click: () => clickElement(parent),
  }

  const defaultFunctions = getDefaultFunctions(functions, parent)

  const updatedFunctions = Object.keys(wiringMap).reduce((memo, wiringKey) => {
    const findName = `find${uppercaseFirstLetter(wiringKey)}`
    const find = async (findArgs = {}) => {
      const wiring = wiringMap[wiringKey]
      const {
        findValue,
        findType = 'testId',
        isMultiple,
        shouldFindInBaseElement,
      } = wiring
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
          return foundElements[index]
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
        return null
      }
      const element = await performFind()

      const returnedFromWithin = within(element)
      const defaultFunctions = getDefaultFunctions(returnedFromWithin, element)
      const {children, extend = () => ({})} = getWiringWithTypesApplied(
        element,
        wiring,
        returnedFromWithin,
      )
      if (!children) {
        return {
          [wiringKey]: element,
          ...defaultFunctions,
          ...extend(element, returnedFromWithin),
        }
      }

      return {
        [wiringKey]: element,
        ...defaultFunctions,
        ...addExtraFunctions(children, returnedFromWithin, extend, element),
      }
    }
    return {
      ...memo,
      [findName]: find,
    }
  }, {})
  return {
    ...updatedFunctions,
    ...defaultFunctions,
    ...extend(parent, {...functions, ...updatedFunctions, ...defaultFunctions}),
  }
}

const matchesTestId = (object, testId) => {
  return (
    object &&
    typeof object === 'object' &&
    object.querySelectorAll &&
    object.getAttribute('data-testid') === testId
  )
}

export default (wiring, config = {}) => wiringKeys => {
  const {customFunctions = {}, customQueries = {}} = config
  const {global = () => ({}), withinElement = funcs => funcs} = customFunctions
  const {children, extend} = wiring
  const serialize = val => {
    const foundChildName = Object.keys(children).find(childName =>
      matchesTestId(val, children[childName].findValue),
    )
    if (!foundChildName) {
      throw new Error(
        "Object can't be serialzied,  make sure it's defined in wiring",
      )
    }
    console.log(
      serializeElement(
        children[foundChildName],
        val,
        customFunctions,
        customQueries,
      ),
    )
  }
  wiringKeys.forEach(key => {
    expect.addSnapshotSerializer({
      test: val => matchesTestId(val, wiring.children[key].findValue),
      print: val => {
        return serializeElement(
          wiring.children[key],
          val,
          customFunctions,
          customQueries,
        )
      },
    })
  })

  return getRenderHandler({
    customQueries,
    render: config.render,
    customFunctions: {
      global: globalFunctions => global({...globalFunctions, serialize}),
      withinElement: withinElementFunctions => {
        const updatedWithinElementFunctions = withinElement(
          withinElementFunctions,
        )
        return addExtraFunctions(
          children,
          {...withinElementFunctions, ...updatedWithinElementFunctions},
          extend,
        )
      },
    },
  })
}
