import {within} from '@testing-library/react'
import {combine} from './helpers'
import getWithinElementFunctions from './getWithinElementFunctions'
import {getQueryFunction, uppercaseFirstLetter} from './functionHelpers'
import getQueryFunctions from './getQueryFunctions'
import getWiringWithTypesApplied from './getWiringWithTypesApplied'

const serializeElement = (
  wiringItem,
  element,
  customFunctions,
  customQueries,
  globalFunctions,
  getWithinElementCustomFunctions,
  rootChildren,
) => {
  const renderFunctions = within(element)

  const getAllWithinElementFunctions = ({
    element: currentElement,
    renderFunctions: currentRenderFunctions,
  }) => {
    const queryFunctions = getQueryFunctions({
      element: currentElement,
      queryMap: customQueries,
      globalFunctions,
      renderFunctions: currentRenderFunctions,
    })

    const withinElementFunctions = getWithinElementFunctions({
      element: currentElement,
      getCustomFunctions: getWithinElementCustomFunctions,
      renderFunctions: currentRenderFunctions,
      queryFunctions,
      globalFunctions,
      rootChildren,
    })

    return {
      ...currentRenderFunctions,
      ...queryFunctions,
      ...withinElementFunctions,
    }
  }

  const withinElementFunctions = getAllWithinElementFunctions({
    renderFunctions,
    element,
  })

  const {children, serialize} = getWiringWithTypesApplied(
    element,
    wiringItem,
    withinElementFunctions,
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
        functions: withinElementFunctions,
        isInBase: shouldFindInBaseElement,
        targetType: uppercaseFirstLetter(findType),
        isMultiple,
        baseElement: document.body,
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
              globalFunctions,
              getWithinElementCustomFunctions,
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
    ...withinElementFunctions,
    ...serializedChildren,
    combine,
  })
}

export default serializeElement
