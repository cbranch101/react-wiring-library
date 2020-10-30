import React, {useState} from 'react'
import {
  cleanup,
  wait,
  waitForDomChange,
  fireEvent,
} from '@testing-library/react'
import {getRender} from '../index'

afterEach(cleanup)

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
          serialize: val => {
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
        expect(wait).toEqual(renderFunctions.wait)
        expect(waitForDomChange).toEqual(renderFunctions.waitForDomChange)
        expect(fireEvent).toEqual(renderFunctions.fireEvent)
      })

      test('getTextContent should get get the text content for the given test id', () => {
        const {getTextContent} = render(fixture)
        expect(getTextContent('label')).toEqual('Label Content')
      })

      test('getTextContents should get an array of textContents from an array of test ids', () => {
        const {getTextContents} = render(fixture)
        expect(getTextContents(['label', 'title'])).toEqual([
          'Label Content',
          'Title Content',
        ])
      })

      test('withinBaseElement should return all withinElement functions within the base element', async () => {
        const render = getRender(wiring)
        const {baseElement, withinBaseElement} = render(fixture)
        const newElement = document.createElement('div')
        newElement.setAttribute('data-testid', 'in-base-element')
        baseElement.appendChild(newElement)
        const {findByTestId} = withinBaseElement()
        await findByTestId('in-base-element')
      })
    })
    // describe('in the element context', () => {
    //   describe('if the current element has a data-testid attribute', () => {
    //     test('testId should be returned', async () => {
    //       const {findWrapper} = render(fixture)
    //       const allStuff = await findWrapper()
    //       console.log(allStuff)
    //       expect(testId).toEqual('wrapper')
    //     })
    //     // move tests from default globalFunctions
    //     // add click
    //   })
    //   test('all element context functions should be available at each level', () => {
    //     // confirm that the same function is available at three levels
    //   })
    // })
  })
  describe('when customFunctions is provided in options', () => {
    describe('and a withinElement function is provided', () => {
      test.skip('all returned functions should be available from every find function and serialize', async () => {
        const options = {
          customFunctions: {
            withinElement: ({container}) => {
              return {
                isDisabled: () => container.hasAttribute('data-disabled'),
              }
            },
          },
        }
        const render = getRender(wiring, options)

        const {findWrapper} = render(fixture)
        const {isDisabled, findLabel} = await findWrapper()
        console.log(isDisabled)
        expect(isDisabled()).toEqual(false)

        // pass in a within element function, confirm that it's available and works
      })
    })
    describe('and a global function is provided', () => {
      test('all returned functions should available in every find function, serialize and be returned from render', () => {
        // pass in a global function, confirm that it's available and works
      })
    })
  })
})
