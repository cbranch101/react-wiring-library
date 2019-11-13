import React, {useState} from 'react'
import {cleanup} from '@testing-library/react'
import buildWiring from '../index'

afterEach(cleanup)

const Input = () => {
  const [focused, setFocus] = useState(false)
  return (
    <input
      data-focused={focused || undefined}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      data-testid="input"
      type="text"
    />
  )
}

const blurFixture = <Input />

const blurWiring = {
  children: {
    input: {
      findValue: 'input',
      serialize: val => {
        const hasFocus = !!val.getAttribute('data-focused')
        return `[${hasFocus ? 'Focused: ' : ''}${val.value}]`
      },
    },
  },
}

describe('Default functions returned with all wiring', () => {
  test('focus, blur and typeInto, should behave as expected', async () => {
    const getRender = buildWiring(blurWiring)
    const render = getRender(['input'])
    const {findInput} = render(blurFixture)
    const {input, blur, focus, typeInto} = await findInput()
    expect(input).toMatchSnapshot('initial render')
    focus()
    expect(input).toMatchSnapshot('after calling focus')
    typeInto('Some stuff')
    expect(input).toMatchSnapshot('after typing Some stuff')
    blur()
    expect(input).toMatchSnapshot('after blurring')
  })
})
