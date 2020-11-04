export const combine = (...strings) => {
  return strings.filter(string => string !== undefined).join('\n')
}

export const matchesTestId = (object, testId) => {
  return (
    object &&
    typeof object === 'object' &&
    object.querySelectorAll &&
    object.getAttribute('data-testid') === testId
  )
}
