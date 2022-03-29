import React, { useState } from 'react'
import { fireEvent, wait, waitForDomChange } from '@testing-library/react'
import { getRender } from '../index'

const TestComponent = () => {
  const [focused, setFocus] = useState(false)
  return (
    <div data-testid="wrapper">
      <div data-disabled data-testid="label">
        Label Content
      </div>
      <div data-testid="title">Title Content</div>
      <input
        data-focused={focused || undefined}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        data-testid="input"
        type="text"
      />
    </div>
  )
}

const fixture = <TestComponent />

const wiring = {
  children: {
    wrapper: {
      findValue: 'wrapper',
      children: {
        title: {
          findValue: 'title',
        },
        label: {
          findValue: 'label',
        },
        input: {
          findValue: 'input',
          serialize: (val) => {
            const hasFocus = !!val.getAttribute('data-focused')
            return `[${hasFocus ? 'Focused: ' : ''}${val.value}]`
          },
        },
      },
    },
  },
}

const render = getRender(wiring)

describe('Custom Functions', () => {
  describe('by default', () => {
    describe('in any context', () => {
      test('the required functions from react-testing-library should be available', () => {
        const renderFunctions = render(fixture)
        // eslint-disable-next-line testing-library/await-async-utils
        expect(wait).toEqual(renderFunctions.wait)
        // eslint-disable-next-line testing-library/await-async-utils
        expect(waitForDomChange).toEqual(renderFunctions.waitForDomChange)
        expect(fireEvent).toEqual(renderFunctions.fireEvent)
      })

      test('getTextContent should get get the text content for the given test id', async () => {
        const { getTextContent } = render(fixture)
        const label = await getTextContent('label')
        expect(label).toEqual('Label Content')
      })

      test('getTextContents should get an array of textContents from an array of test ids', () => {
        const { getTextContents } = render(fixture)
        expect(getTextContents(['label', 'title'])).toEqual([
          'Label Content',
          'Title Content',
        ])
      })
    })
    describe('in the element context', () => {
      describe('if the current element has a data-testid attribute', () => {
        test('testId should be returned', async () => {
          const { findWrapper } = render(fixture)
          const { testId } = await findWrapper()
          expect(testId).toEqual('wrapper')
        })
      })
    })
  })

  describe('when customFunctions is provided in options', () => {
    describe('and a withinElement function is provided', () => {
      test('all returned functions should be available from every find function and serialize', async () => {
        const options = {
          customFunctions: {
            withinElement: ({ container }) => {
              return {
                isDisabled: () => container.hasAttribute('data-disabled'),
              }
            },
          },
        }
        const render = getRender(wiring, options)

        const { findWrapper } = render(fixture)
        const { isDisabled } = await findWrapper()
        expect(isDisabled()).toEqual(false)
      })
      test('all required functions types should be available from withinElement builder function', async () => {
        const options = {
          customQueries: {
            // this wont' actually work, but all I'm trying to do is verify that the functions
            // are being passed correctly
            IconName: () => { },
          },
          customFunctions: {
            withinElement: ({
              customGlobalFunction,
              clickElement,
              serialize,
              click,
              findByIconName,
              eliminateByText,
              findByText,
            }) => {
              return {
                getAvailableFunctionTypes: () => ({
                  customGlobal: !!customGlobalFunction,
                  defaultGlobal: !!clickElement,
                  extendedGlobal: !!serialize,
                  defaultWithinElement: !!click,
                  customQueries: !!findByIconName,
                  extendedQueryTypes: !!eliminateByText,
                  standardFunctions: !!findByText,
                }),
              }
            },
            global: () => ({
              customGlobalFunction: () => { },
            }),
          },
        }
        const render = getRender(wiring, options)

        const { findWrapper } = render(fixture)
        const { getAvailableFunctionTypes } = await findWrapper()
        expect(getAvailableFunctionTypes()).toMatchSnapshot(
          'available function types',
        )
      })
    })
    describe('and a global function is provided', () => {
      test('the returned global functions should be available from every level with the right types passed in', () => {
        const options = {
          customFunctions: {
            global: ({ clickElement }) => ({
              getAvailableFunctionTypes: () => ({
                defaultGlobal: !!clickElement,
              }),
            }),
          },
        }
        const render = getRender(wiring, options)

        const { getAvailableFunctionTypes } = render(fixture)
        expect(getAvailableFunctionTypes()).toMatchSnapshot(
          'available function types',
        )
      })
    })
  })
})
