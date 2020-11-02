import {addAllCustomFunctions, combine} from './helpers'
import {
  getWiringWithTypesApplied,
  getQueryFunction,
  uppercaseFirstLetter,
} from './functionHelpers'
import getRenderHandler from './getRenderHandler'

const serializeElement = (
  wiringItem,
  element,
  customFunctions,
  customQueries,
) => {
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

const matchesTestId = (object, testId) => {
  return (
    object &&
    typeof object === 'object' &&
    object.querySelectorAll &&
    object.getAttribute('data-testid') === testId
  )
}

export const getRender = (wiring, config = {}) => {
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
  Object.keys(wiring.children).forEach(key => {
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
    wiringChildren: children,
    extend,
    queryMap: customQueries,
    customFunctions: {
      global: globalFunctions => {
        const output = global({...globalFunctions, serialize})
        return {
          ...output,
          serialize,
        }
      },
      withinElement,
    },
  })
}
