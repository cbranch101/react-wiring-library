const engineMap = {
  react: (library) => {
    const {
      waitFor,
      wait,
      fireEvent,
      waitForDomChange,
      waitForElementToBeRemoved,
      within,
      buildQueries,
      render,
    } = library

    const getBasicEventFunction = (name) => {
      return (element) => fireEvent[name](element)
    }

    return {
      includedInGlobal: {
        fireEvent,
        waitForDomChange,
      },
      waitFor,
      wait,
      within,
      render,
      buildQueries,
      waitForElementToBeRemoved,
      events: {
        clickElement: getBasicEventFunction('click'),
        focusElement: getBasicEventFunction('focus'),
        typeIntoElement: (text, element) => {
          return fireEvent.change(element, {target: {value: text}})
        },
        blurElement: getBasicEventFunction('blur'),
      },
    }
  },
  storybook: (library) => {
    const {
      waitFor,
      wait,
      userEvent,
      waitForElementToBeRemoved,
      within,
      buildQueries,
    } = library

    const getBasicEventFunction = (name) => {
      return (element) => userEvent[name](element)
    }

    return {
      includedInGlobal: {
        userEvent,
      },
      waitFor,
      wait,
      within,
      blockSerialize: true,
      render: (canvas) => within(canvas),
      buildQueries,
      waitForElementToBeRemoved,
      events: {
        clickElement: getBasicEventFunction('click'),
        focusElement: getBasicEventFunction('focus'),
        typeIntoElement: (text, options, element) => {
          return userEvent.type(element, text, options)
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
