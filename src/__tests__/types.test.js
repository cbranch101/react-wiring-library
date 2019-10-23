import React from 'react'
import buildWiring from '../index'

afterEach(() => {
  const body = document.body
  while (body.firstChild) {
    body.removeChild(body.firstChild)
  }
})

const Item = ({name, type, details}) => {
  return (
    <li data-type={type} data-testid="item">
      <span data-testid="name">{name}</span>
      {type === 'details' && <span data-testid="details">{details}</span>}
    </li>
  )
}

const List = ({items}) => {
  return (
    <ul data-testid="list">
      {items.map((item, index) => (
        <Item key={index} {...item} />
      ))}
    </ul>
  )
}

const typeWithoutExtendFixture = (
  <List
    items={[
      {name: 'Details Type', type: 'details', details: 'This is my details'},
    ]}
  />
)

const typeWithoutChildrenFixture = (
  <List items={[{name: 'Indent Type', type: 'indent'}]} />
)

const wiring = {
  children: {
    list: {
      findValue: 'list',
      serialize: (val, {combine, itemStrings}) => {
        return combine(...itemStrings)
      },
      children: {
        item: {
          isMultiple: true,
          findValue: 'item',
          getCurrentType: val => val.getAttribute('data-type'),
          serialize: (val, {nameString}) => {
            return `- ${nameString}`
          },
          types: {
            details: {
              serialize: (val, {detailsSpanString}, baseString) => {
                return `${baseString} ${detailsSpanString}`
              },
              children: {
                detailsSpan: {
                  findValue: 'details',
                  serialize: val => `Details: ${val.textContent}`,
                },
              },
            },
            indent: {
              serialize: (val, functions, baseString) =>
                `--------${baseString}`,
            },
          },

          children: {
            name: {
              findValue: 'name',
              serialize: val => val.textContent,
            },
          },
        },
      },
    },
  },
}

const typedWiringWithoutSerialize = {
  ...wiring,
  children: {
    ...wiring.children,
    list: {
      ...wiring.children.list,
      children: {
        ...wiring.children.list.children,
        item: {
          ...wiring.children.list.children.item,
          serialize: undefined,
        },
      },
    },
  },
}

describe('Typed Wiring', () => {
  describe('if providing a type without extend', () => {
    test('should just not extend anything', async () => {
      const getRender = buildWiring(wiring)
      const render = getRender(['list'])
      const {findList} = render(typeWithoutExtendFixture)
      const {list} = await findList()
      expect(list).toMatchSnapshot('on initial render')
    })
  })
  describe('if providing a type without children', () => {
    test('should not add any custom children', async () => {
      const getRender = buildWiring(wiring)
      const render = getRender(['list'])
      const {findList} = render(typeWithoutChildrenFixture)
      const {list} = await findList()
      expect(list).toMatchSnapshot('on initial render')
    })
  })
  describe('if a typed wiring does not provide serialize', () => {
    test('undefined should be passed into the child type serializers', async () => {
      const getRender = buildWiring(typedWiringWithoutSerialize)
      const render = getRender(['list'])
      const {findList} = render(typeWithoutExtendFixture)
      const {list} = await findList()
      expect(list).toMatchSnapshot('on initial render')
    })
  })
})
