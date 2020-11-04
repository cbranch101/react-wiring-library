const getLogSerialize = ({
  children,
  customFunctions,
  customQueries,
  globalFunctions,
}) => {
  return val => {
    const foundChildName = Object.keys(children).find(childName =>
      matchesTestId(val, children[childName].findValue),
    )
    if (!foundChildName) {
      throw new Error(
        "Object can't be serialzied,  make sure it's defined in wiring",
      )
    }
    console.log(
      serializeElement(
        children[foundChildName],
        val,
        customFunctions,
        customQueries,
        globalFunctions,
        getWithinElementCustomFunctions,
      ),
    )
  }
}
