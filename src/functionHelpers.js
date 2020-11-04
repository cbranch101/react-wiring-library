import {within} from '@testing-library/react'

export const uppercaseFirstLetter = string =>
  string.charAt(0).toUpperCase() + string.slice(1)

export const getQueryFunction = ({
  isMultiple,
  functions,
  queryType,
  baseElement,
  isInBase,
  targetType,
}) => {
  const currentFunctions = isInBase ? within(baseElement) : functions
  const fullTargetType = uppercaseFirstLetter(targetType)
  const findOne = `${queryType}By${fullTargetType}`
  const findMany = `${queryType}AllBy${fullTargetType}`
  const findName = isMultiple ? findMany : findOne
  return currentFunctions[findName]
}
