import {cleanup} from 'react-testing-library'
import React from 'react'
import {combine} from '../helpers'
import buildWiring from '../index'
import CounterList from '../CounterList'

afterEach(() => {
  jest.clearAllMocks()
  cleanup()
})

const fixture = (
  <CounterList
    counters={[
      {
        name: 'first',
        type: 'default',
      },
      {
        name: 'second',
        type: 'reset',
      },
      {
        name: 'third',
        type: 'addTen',
      },
    ]}
    listName="Some counters"
  />
)

const wiring = {
  extend: (val, {findCounterContainer}) => ({
    findCounterList: async () => {
      const {findCounterList, counterContainer} = await findCounterContainer()
      const returned = await findCounterList()
      return {...returned, counterContainer}
    },
  }),
  children: {
    counterContainer: {
      findValue: 'counter-container',
      extend: (val, {findShowButton, findCounterList}) => ({
        findCounterList: async () => {
          const {click} = await findShowButton()
          click()
          return findCounterList()
        },
      }),
      serialize: (val, {counterListString, summaryString}) => {
        return combine(counterListString, summaryString)
      },
      children: {
        showButton: {
          findValue: 'Show',
          findType: 'text',
          extend: (val, {clickElement}) => ({
            click: () => clickElement(val),
          }),
          serialize: () => '[Show]',
        },
        summary: {
          findValue: new RegExp('^Total value of counters'),
          findType: 'text',
          shouldFindInBaseElement: true,
          serialize: val => val.textContent,
        },
        counterList: {
          findValue: 'list',
          serialize: (val, {getTextContents, counterStrings}) => {
            const [listName] = getTextContents(['list-name'])
            return combine(listName, ...counterStrings)
          },
          children: {
            counter: {
              isMultiple: true,
              findValue: new RegExp('^counter'),
              getCurrentType: val => {
                const type = val.getAttribute('data-type')
                return type === 'default' ? undefined : type
              },
              types: {
                addTen: {
                  serialize: (val, {addTenButtonString}, baseString) => {
                    return `${baseString} ${addTenButtonString}`
                  },
                  extend: (val, {findAddTenButton}) => ({
                    addTen: async () => {
                      const {click} = await findAddTenButton()
                      click()
                    },
                  }),
                  children: {
                    addTenButton: {
                      findValue: 'Add Ten',
                      findType: 'text',
                      extend: (val, {clickElement}) => ({
                        click: () => clickElement(val),
                      }),
                      serialize: () => '[Add ten]',
                    },
                  },
                },
                reset: {
                  serialize: (val, {resetButtonString}, baseString) => {
                    return `${baseString} ${resetButtonString}`
                  },
                  extend: (val, {findResetButton}) => ({
                    reset: async () => {
                      const {click} = await findResetButton()
                      click()
                    },
                  }),
                  children: {
                    resetButton: {
                      findValue: 'Reset',
                      findType: 'text',
                      extend: (val, {clickElement}) => ({
                        click: () => clickElement(val),
                      }),
                      serialize: () => '[Reset]',
                    },
                  },
                },
              },
              extend: (val, {clickText}) => {
                return {
                  increase: () => clickText('+'),
                  decrease: () => clickText('-'),
                }
              },
              serialize: (val, {getTextContents}) => {
                const [name, count] = getTextContents(['name', 'count'])
                return `-${name} ${count}`
              },
            },
          },
        },
      },
    },
  },
}

describe('buildWiring helper', () => {
  test('should correctly handler serializers', async () => {
    const getRender = buildWiring(wiring)
    const render = getRender(['counterContainer'])
    const {findCounterList} = render(fixture)
    const {counterContainer, findCounter} = await findCounterList()
    const assertFirstRow = async () => {
      const {increase, decrease} = await findCounter({index: 0})
      expect(counterContainer).toMatchSnapshot(
        'correctly serializes after calling buildWiring',
      )
      increase()
      expect(counterContainer).toMatchSnapshot('counter increases on first row')
      decrease()
      expect(counterContainer).toMatchSnapshot('counter decreases on first row')
    }

    await assertFirstRow()

    const assertSecondRow = async () => {
      const {increase, reset} = await findCounter({
        filter: (counter, testId) => testId === 'counter_second',
      })
      increase()
      expect(counterContainer).toMatchSnapshot(
        'counter increases on second row',
      )
      await reset()
      expect(counterContainer).toMatchSnapshot(
        'counter resets to zero on second row',
      )
    }

    await assertSecondRow()

    const assertThirdRow = async () => {
      const {addTen} = await findCounter({index: 2})
      await addTen()
      expect(counterContainer).toMatchSnapshot('10 is added to the third row')
    }
    await assertThirdRow()

    const assertErrors = async () => {
      await expect(findCounter({index: 10})).rejects.toThrow(
        'You tried to find index 10 in findCounter but 3 is the highest index',
      )
      await expect(findCounter({filter: () => false})).rejects.toThrow(
        "the filter function passed into findCounter didn't find anything",
      )
      await expect(findCounter({filter: () => true})).rejects.toThrow(
        'the filter function passed into findCounter returned 3 elements, it should only return one',
      )
      await expect(findCounter()).rejects.toThrow(
        'You tried to call findCounter which was set as isMultiple, without providing either an index, or a filter function',
      )
    }

    await assertErrors()
  })
  test('should be possible to call manually call serialize', async () => {
    jest.spyOn(console, 'log')
    const getRender = buildWiring(wiring)
    const render = getRender(['counterContainer'])
    const {findCounterList, serialize} = render(fixture)
    const {counterContainer} = await findCounterList()
    serialize(counterContainer)
    expect(console.log.mock.calls[0][0]).toMatchSnapshot(
      'initial render passed into console.log',
    )
    expect(() => serialize({foo: 'bar'})).toThrow(
      "Object can't be serialzied,  make sure it's defined in wiring",
    )
  })
})
