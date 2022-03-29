import React from 'react'
import {getRender} from '../index'

const Root = () => {
  return (
    <div data-custom-value="foo" data-testid="root">
      Root
    </div>
  )
}

const fixture = <Root />

const wiring = {
  children: {
    root: {
      findValue: 'root',
      serialize: () => 'Root',
    },
  },
}

const functionReduceTest = () => {
  const plugins = [
    {
      getFuncs: (funcs) => {
        return {two: () => funcs.one()}
      },
    },
    {
      getFuncs: (funcs) => {
        return {two: () => 'foo', three: () => funcs.two()}
      },
    },
  ]

  const getGetAllFunctions = () => {
    return plugins.reduceRight(
      (memo, plugin) => {
        const {getFuncs} = plugin
        return (funcs) => {
          const updatedFuncs = {
            ...funcs,
            ...getFuncs(funcs),
          }
          return memo(updatedFuncs)
        }
      },
      (funcs) => funcs,
    )
  }
  const getAllFunctions = getGetAllFunctions()
  const {one, two, three} = getAllFunctions({one: () => 'test'})
  console.log({
    one: one(),
    two: two(),
    three: three(),
  })
}

functionReduceTest()

describe('Plugins', () => {
  describe('when getWithinElementFunctions is added to a plugin', () => {
    test.skip('the returned functions should be added to all find nodes', async () => {
      const customGlobal = () => {}
      const config = {
        plugins: [
          {
            getWithinElementFunctions: (element) => {
              return {
                getCustomValue: () => element.getAttribute('data-custom-value'),
              }
            },
          },
        ],
      }
      const render = getRender(wiring, config)
      const {findRoot, customGlobalFunction} = render(fixture)
      expect(customGlobalFunction).toEqual(customGlobal)
      const {root, getCustomValue} = await findRoot()
      console.log(getCustomValue)
      expect(root).toMatchSnapshot('initial render')
    })
  })
})
