import {fireEvent, waitForDomChange, wait} from '@testing-library/react'
import getSerializeLog from './getSerializeLog'

const getDefaultGlobalFunctions = () => ({
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

const getExtendedGlobalFunctions = ({
  rootChildren,
  customQueryMap,
  getWithinElementCustomFunctions,
  globalFunctions,
}) => {
  const serialize = getSerializeLog({
    rootChildren,
    getWithinElementCustomFunctions,
    customQueryMap,
    globalFunctions,
  })
  return {
    serialize,
  }
}

const getGlobalFunctions = ({
  getCustomGlobalFunctions,
  customQueryMap,
  getWithinElementCustomFunctions,
  rootChildren,
}) => {
  const defaultGlobalFunctions = getDefaultGlobalFunctions()

  const customGlobalFunctions = getCustomGlobalFunctions({
    ...defaultGlobalFunctions,
  })

  const globalFunctions = {
    ...defaultGlobalFunctions,
    ...customGlobalFunctions,
  }
  const extendGlobalFunctions = getExtendedGlobalFunctions({
    globalFunctions,
    customQueryMap,
    getWithinElementCustomFunctions,
    rootChildren,
  })
  return {
    ...globalFunctions,
    ...extendGlobalFunctions,
  }
}

export default getGlobalFunctions
