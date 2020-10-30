import {within, fireEvent, waitForDomChange} from '@testing-library/react'

const getDefaultGlobalFunctions = ({baseElement}) => ({
  withinBaseElement: () => within(baseElement),
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
