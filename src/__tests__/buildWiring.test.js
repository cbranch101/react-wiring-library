import React from 'react'
import {combine} from '../helpers'
import buildWiring from '../index'
import CounterList from './CounterList'

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
  })
})
