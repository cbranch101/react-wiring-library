import {queryHelpers, buildQueries} from 'react-testing-library'

const {
  queryAllByAttribute,
  getElementError,
  getMultipleElementsFoundError,
} = queryHelpers

const queryAllByIconName = (element, iconName) => {
  return queryAllByAttribute('xlink:href', element, iconName)
}

const queryAllByTag = (element, tag) => {
  return Array.from(element.querySelectorAll(tag))
}

const queryAllByClassStart = (element, classStart) => {
  return queryHelpers.queryAllByAttribute(
    'class',
    element,
    RegExp(`^${classStart}`),
  )
}

const getQueries = (func, type) => {
  const [queryBy, getAllBy, getBy, findAllBy, findBy] = buildQueries(
    func,
    getMultipleElementsFoundError,
    getElementError,
  )

  const namedQueries = {
    queryAllBy: func,
    queryBy,
    getAllBy,
    getBy,
    findAllBy,
    findBy,
  }

  return Object.keys(namedQueries).reduce(
    (memo, queryName) => ({
      ...memo,
      [`${queryName}${type}`]: namedQueries[queryName],
    }),
    {},
  )
}

export default {
  ...getQueries(queryAllByIconName, 'IconName'),
  ...getQueries(queryAllByClassStart, 'ClassStartLastResort'),
  ...getQueries(queryAllByTag, 'Tag'),
  queryAllByTag,
}
