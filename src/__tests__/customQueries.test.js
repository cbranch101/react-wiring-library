import React, {Fragment, useState} from 'react'
import {queryHelpers} from '@testing-library/react'
import buildWiring from '../index'
const {queryAllByAttribute} = queryHelpers
const Icon = ({name, onClick}) => <span onClick={onClick} xlinkHref={name} />

const IconControls = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [page, setPage] = useState(0)
  return (
    <div data-testid="controls">
      <button
        data-testid="show"
        onClick={() =>
          setTimeout(() => setIsOpen(prevIsOpen => !prevIsOpen), 20)
        }
      >
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && (
        <Fragment>
          <Icon
            name="forward"
            onClick={() => setPage(prevPage => prevPage + 1)}
          />
          <Icon
            name="backward"
            onClick={() => setPage(prevPage => prevPage - 1)}
          />
        </Fragment>
      )}
      <span>Page: {page}</span>
    </div>
  )
}

const fixture = <IconControls />

const config = {
  customQueries: {
    IconName: (element, iconName) =>
      queryAllByAttribute('xlink:href', element, iconName),
  },
}

const wiring = {
  children: {
    iconControls: {
      findValue: 'controls',
      serialize: (
        val,
        {
          combine,
          showButtonString,
          forwardIconString,
          backwardIconString,
          pageString,
        },
      ) => {
        return combine(
          showButtonString,
          forwardIconString,
          backwardIconString,
          pageString,
        )
      },
      extend: (
        val,
        {
          findShowButton,
          findByIconName,
          eliminateByIconName,
          findByIconNameAndClick,
        },
      ) => {
        const clickShowButton = async () => {
          const {click} = await findShowButton()
          click()
        }
        return {
          showIcons: async () => {
            await clickShowButton()
            await findByIconName('forward')
          },
          showIconsAndGoForward: async () => {
            clickShowButton()
            await findByIconNameAndClick('forward')
          },
          hideIcons: async () => {
            await clickShowButton()
            await eliminateByIconName('forward')
          },
        }
      },
      children: {
        showButton: {
          findValue: 'show',
          serialize: val => `[${val.textContent}]`,
        },
        forwardIcon: {
          findValue: 'forward',
          findType: 'iconName',
          serialize: () => '⏩',
        },
        backwardIcon: {
          findValue: 'backward',
          findType: 'iconName',
          serialize: () => '⏪',
        },
        page: {
          findValue: /^Page:/,
          findType: 'text',
          serialize: val => val.textContent,
        },
      },
    },
  },
}

describe('Custom Queries', () => {
  test('custom queries should work with all built in functions', async () => {
    const getRender = buildWiring(wiring, config)
    const render = getRender(['iconControls'])
    const {findIconControls} = render(fixture)
    const {
      showIcons,
      showIconsAndGoForward,
      hideIcons,
      iconControls,
    } = await findIconControls()
    expect(iconControls).toMatchSnapshot('on initial load')
    await showIcons()
    expect(iconControls).toMatchSnapshot('after showing icons')
    await hideIcons()
    expect(iconControls).toMatchSnapshot('after hiding icons')
    await showIconsAndGoForward()
    expect(iconControls).toMatchSnapshot(
      'after showing icons and going forward',
    )
  })
})
