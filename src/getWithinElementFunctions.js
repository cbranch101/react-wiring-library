const getDefaultWithinElementFunctions = ({
  element,
  renderFunctions,
  globalFunctions,
}) => {
  const {getByTestId, within} = renderFunctions

  const {
    clickElement,
    focusElement,
    blurElement,
    typeIntoElement,
  } = globalFunctions
  const getTextContent = id => getByTestId(id).textContent
  const testId = element && element.getAttribute('data-testid')
  return {
    testId,
    container: renderFunctions.container || element,
    getTextContent,
    within,
    getTextContents: testIds => testIds.map(getTextContent),
    click: () => clickElement(element),
    focus: () => focusElement(element),
    typeInto: text => typeIntoElement(text, element),
    blur: () => blurElement(element),
  }
}

const getWithinElementFunctions = ({
  element,
  getCustomFunctions,
  renderFunctions,
  queryFunctions,
  globalFunctions,
}) => {
  const defaultWithinElementFunctions = getDefaultWithinElementFunctions({
    element,
    renderFunctions,
    globalFunctions,
  })
  const customWithinElementFunctions = getCustomFunctions({
    ...renderFunctions,
    ...defaultWithinElementFunctions,
    ...globalFunctions,
    ...queryFunctions,
  })
  return {
    ...defaultWithinElementFunctions,
    ...customWithinElementFunctions,
  }
}

export default getWithinElementFunctions
