const getWiringWithTypesApplied = (parent, wiring, functions) => {
  const {
    getCurrentType,
    types,
    extend = () => ({}),
    children,
    serialize = () => {},
  } = wiring
  if (!getCurrentType || !types) {
    return {...wiring, extend, serialize}
  }
  const type = getCurrentType(parent, functions)
  if (!type) {
    return {...wiring, extend, serialize}
  }
  const {
    types: typesForType,
    getCurrentType: getCurrentTypeForType,
    extend: extendForType,
    children: childrenForType,
    serialize: serializeForType,
  } = types[type]
  const applyTypeToExtend = () => {
    if (!extendForType) {
      return extend
    }

    return (val, functions) => {
      const extendedFunctions = extend(val, functions)
      const functionsForType = extendForType(val, {
        ...functions,
        ...extendedFunctions,
      })
      return {
        ...extendedFunctions,
        ...functionsForType,
      }
    }
  }

  const applyTypeToChildren = () => {
    if (!childrenForType) {
      return children
    }
    return {
      ...(children || {}),
      ...childrenForType,
    }
  }

  const applyTypeToSerialize = () => {
    if (!serializeForType) {
      return serialize
    }
    return (val, functions) => {
      const baseString = serialize(val, functions)
      return serializeForType(val, functions, baseString)
    }
  }

  const updatedWiring = {
    ...wiring,
    extend: applyTypeToExtend(),
    children: applyTypeToChildren(),
    serialize: applyTypeToSerialize(),
  }

  if (!typesForType || !getCurrentTypeForType) {
    return updatedWiring
  }

  return getWiringWithTypesApplied(
    parent,
    {
      ...updatedWiring,
      types: typesForType,
      getCurrentType: getCurrentTypeForType,
    },
    functions,
  )
}

export default getWiringWithTypesApplied
