import {fireEvent, waitForDomChange, wait} from '@testing-library/react'
import {matchesTestId} from './helpers'
import serializeElement from './serializeElement'

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
  customQueries,
  getWithinElementCustomFunctions,
  globalFunctions,
}) => {
  const serialize = val => {
    const foundChildName = Object.keys(rootChildren).find(childName =>
      matchesTestId(val, rootChildren[childName].findValue),
    )
    if (!foundChildName) {
      throw new Error(
        "Object can't be serialzied,  make sure it's defined in wiring",
      )
    }
    console.log(
      serializeElement(
        rootChildren[foundChildName],
        val,
        {},
        customQueries,
        globalFunctions,
        getWithinElementCustomFunctions,
      ),
    )
  }

  return {
    serialize,
  }
}

const getGlobalFunctions = ({
  getCustomGlobalFunctions,
  customQueries,
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
    customQueries,
    getWithinElementCustomFunctions,
    rootChildren,
  })
  return {
    ...globalFunctions,
    ...extendGlobalFunctions,
  }
}

export default getGlobalFunctions
