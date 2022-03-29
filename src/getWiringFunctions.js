import {uppercaseFirstLetter} from './helpers'
import getQueryFunction from './getQueryFunction'
import getWiringWithTypesApplied from './getWiringWithTypesApplied'

const getWiringFunctions =
  (engine) =>
  ({
    wiringChildren,
    baseElement,
    renderFunctions,
    element,
    extend = () => ({}),
    getAllWithinElementFunctions,
  }) => {
    const {within} = engine
    const withinElementFunctions = getAllWithinElementFunctions({
      renderFunctions,
      element,
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
            const query = getQueryFunction(engine)({
              baseElement,
              functions: withinElementFunctions,
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
              const filteredElements = foundElements.filter((element) =>
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
          const childElement = await performFind()

          const childRenderFunctions = within(childElement)

          const withinElementFunctionsForChild = getAllWithinElementFunctions({
            renderFunctions: childRenderFunctions,
            element: childElement,
          })

          const {children, extend} = getWiringWithTypesApplied(
            childElement,
            wiringChild,
            childRenderFunctions,
          )
          if (!children) {
            return {
              [childName]: childElement,
              ...withinElementFunctionsForChild,
              ...extend(childElement, withinElementFunctionsForChild),
            }
          }

          return {
            [childName]: childElement,
            ...withinElementFunctionsForChild,
            ...getWiringFunctions(engine)({
              wiringChildren: children,
              renderFunctions: childRenderFunctions,
              extend,
              baseElement,
              element: childElement,
              getAllWithinElementFunctions,
            }),
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
      ...withinElementFunctions,
      ...extend(parent, {
        ...wiringFunctions,
        ...withinElementFunctions,
      }),
    }
  }

export default getWiringFunctions
