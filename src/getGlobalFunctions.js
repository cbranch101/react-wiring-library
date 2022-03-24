import getSerializeLog from './getSerializeLog'

const getDefaultGlobalFunctions = (engine) => () => ({
  ...engine.events,
  ...engine.includedInGlobal,
})

const getExtendedGlobalFunctions = (engine) => ({
  rootChildren,
  customQueryMap,
  getWithinElementCustomFunctions,
  globalFunctions,
}) => {
  const serialize = getSerializeLog(engine)({
    rootChildren,
    getWithinElementCustomFunctions,
    customQueryMap,
    globalFunctions,
  })
  return {
    serialize,
  }
}

const getGlobalFunctions = (engine) => ({
  getCustomGlobalFunctions,
  customQueryMap,
  getWithinElementCustomFunctions,
  rootChildren,
}) => {
  const defaultGlobalFunctions = getDefaultGlobalFunctions(engine)()
  const customGlobalFunctions = getCustomGlobalFunctions({
    ...defaultGlobalFunctions,
  })

  const globalFunctions = {
    ...defaultGlobalFunctions,
    ...customGlobalFunctions,
  }
  const extendGlobalFunctions = getExtendedGlobalFunctions(engine)({
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
