import {within} from '@testing-library/react'
import {combine, uppercaseFirstLetter} from './helpers'
import getWithinElementFunctions from './getWithinElementFunctions'
import getQueryFunctions from './getQueryFunctions'
import getWiringWithTypesApplied from './getWiringWithTypesApplied'
import getQueryFunction from './getQueryFunction'

const serializeElement = ({
  wiringItem,
  element,
  getWithinElementCustomFunctions,
  customQueryMap,
  globalFunctions,
}) => {
  const renderFunctions = within(element)

  const getAllWithinElementFunctions = ({
    element: currentElement,
    renderFunctions: currentRenderFunctions,
  }) => {
    const queryFunctions = getQueryFunctions({
      element: currentElement,
      customQueryMap,
      globalFunctions,
      renderFunctions: currentRenderFunctions,
    })

    const withinElementFunctions = getWithinElementFunctions({
      element: currentElement,
      getCustomFunctions: getWithinElementCustomFunctions,
      renderFunctions: currentRenderFunctions,
      queryFunctions,
      globalFunctions,
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

      //     ? serializeElement(
      //   child,
      //   childElement,
      //   customFunctions,
      //   customQueries,
      //   globalFunctions,
      //   getWithinElementCustomFunctions,
      // )

      const childElements = isMultiple ? query(findValue) : [query(findValue)]
      const childStrings = childElements.map(childElement =>
        childElement
          ? serializeElement({
              wiringItem: child,
              element: childElement,
              getWithinElementCustomFunctions,
              customQueryMap,
              globalFunctions,
            })
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
