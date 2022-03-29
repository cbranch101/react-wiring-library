import {matchesTestId} from './helpers'
import serializeElement from './serializeElement'

const getSerializeLog =
  (engine) =>
  ({
    rootChildren,
    getWithinElementCustomFunctions,
    customQueryMap,
    globalFunctions,
  }) =>
  (val) => {
    const foundChildName = Object.keys(rootChildren).find((childName) =>
      matchesTestId(val, rootChildren[childName].findValue),
    )
    if (!foundChildName) {
      throw new Error(
        "Object can't be serialzied,  make sure it's defined in wiring",
      )
    }
    return serializeElement(engine)({
      wiringItem: rootChildren[foundChildName],
      element: val,
      getWithinElementCustomFunctions,
      customQueryMap,
      globalFunctions,
    })
  }

export default getSerializeLog
