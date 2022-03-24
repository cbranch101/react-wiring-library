const engineMap = {
  react: (library) => {
    const {waitFor, wait, fireEvent, waitForDomChange, within} = library

    const getBasicEventFunction = (name) => {
      return (element) => fireEvent[name](element)
    }

    return {
      includedInGlobal: {
        waitFor,
        waitForDomChange,
        wait,
        fireEvent,
      },
      within,
      events: {
        clickElement: getBasicEventFunction('click'),
        focusElement: getBasicEventFunction('focus'),
        typeIntoElement: (text, element) => {
          fireEvent.change(element, {target: {value: text}})
        },
        blurElement: getBasicEventFunction('blur'),
      },
    }
  },
}

const getEngine = (engine) => {
  const {type, library} = engine
  return engineMap[type](library)
}

export default getEngine
