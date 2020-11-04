import {within} from '@testing-library/react'
import {uppercaseFirstLetter} from './helpers'
const getQueryFunction = ({
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

export default getQueryFunction
