import * as baseRootFunctions from 'react-testing-library'
import customQueries from './customQueries'

const {
  waitForElement,
  wait,
  within,
  render,
  fireEvent,
  waitForDomChange,
} = baseRootFunctions

export const addCustomQueriesToFunctions = (funcs, val) => {
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
  globalFunctions = {},
  getWithinElementCustomFunctions = () => ({}),
) => {
  const {container, baseElement = document.body} = baseFunctions
  const testId = container && container.getAttribute('data-testid')
  const hasAttribute = attribute =>
    container && !!container.getAttribute(`data-${attribute}`)
  const funcs = addCustomQueriesToFunctions(baseFunctions, container)
  const {debug, getByTestId} = funcs

  const clickElement = element => fireEvent.click(element)

  const typeIntoElement = (text, element) => {
    fireEvent.change(element, {target: {value: text}})
    return waitForDomChange()
  }

  const blurElement = element => {
    fireEvent.blur(element)
  }

  const waitForMS = ms =>
    new Promise(resolve => setTimeout(() => resolve(), ms))

  const baseTypes = [
    'Text',
    'TestId',
    'AltText',
    'PlaceholderText',
    'IconName',
    'Tag',
    'ClassStartLastResort',
  ]

  const builtFunctions = baseTypes.reduce((memo, typeName) => {
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
        getByType: funcs[`getBy${typeName}`],
        queryByType: funcs[`queryBy${typeName}`],
      }),
    }
  }, {})

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
    )
  }

  const withinBaseElement = () => wrappedWithin(baseElement)

  const newFunctions = {
    ...funcs,
    testId,
    hasAttribute,
    ...builtFunctions,
    ...globalFunctions,
    getTextContent,
    getTextContents: testIds => testIds.map(getTextContent),
    fireEvent,
    blurElement,
    withinBaseElement,
    wait,
    within: wrappedWithin,
    typeIntoElement,
    clickElement,
    waitForDomChange,
    waitForMS,
  }
  const withinElementFunctions = getWithinElementCustomFunctions(newFunctions)
  return {
    ...newFunctions,
    ...withinElementFunctions,
  }
}

export default ({
  customFunctions: {
    global: getGlobalCustomFunctions,
    withinElement: getWithinElementCustomFunctions,
  },
}) => renderedComponent => {
  const baseFunctions = render(renderedComponent)
  const globalFunctions = getGlobalCustomFunctions(baseFunctions)

  return getAllFunctions(
    baseFunctions,
    globalFunctions,
    getWithinElementCustomFunctions,
  )
}
