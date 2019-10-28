import React, {useState} from 'react'
import ReactDOM from 'react-dom'

const RenderInBody = ({render}) => {
  return ReactDOM.createPortal(render(), document.body)
}

const Counter = ({type, setCount, name, count, increment, decrement}) => {
  const renderType = () => {
    if (type === 'reset') {
      return <button onClick={() => setCount(() => 0)}>Reset</button>
    }
    if (type === 'addTen') {
      return (
        <button onClick={() => setCount(prevCount => prevCount + 10)}>
          Add Ten
        </button>
      )
    }
    return null
  }
  return (
    <li data-type={type} data-testid={`counter_${name}`}>
      <span data-testid="name">{`${name}: `}</span>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      {renderType()}
    </li>
  )
}

const List = ({listName, counters, renderCounter}) => {
  return (
    <div data-testid="list">
      <span data-testid="list-name">{listName}</span>
      <ul>{counters.map(counter => renderCounter({counter}))}</ul>
    </div>
  )
}

const Summary = ({counters}) => {
  return (
    <RenderInBody
      render={() => {
        return (
          <span data-testid="summary">
            {`Total value of counters: ${counters.reduce(
              (memo, counter) => memo + counter.count,
              0,
            )}`}
          </span>
        )
      }}
    />
  )
}

export default ({listName, counters}) => {
  const [isShown, setIsShown] = useState(false)
  const [counterValuesByName, setCounterValuesByName] = useState({})
  const updateCountForName = (name, func) => {
    setCounterValuesByName(prevCounterValuesByName => {
      const prevCount = prevCounterValuesByName[name] || 0
      return {
        ...prevCounterValuesByName,
        [name]: func(prevCount),
      }
    })
  }

  const increment = name => updateCountForName(name, prevCount => prevCount + 1)
  const decrement = name => updateCountForName(name, prevCount => prevCount - 1)

  const mappedCounters = counters.map(counter => ({
    ...counter,
    count: counterValuesByName[counter.name] || 0,
  }))
  return (
    <div data-testid="counter-container">
      {isShown ? (
        <List
          listName={listName}
          counters={mappedCounters}
          renderCounter={({counter}) => {
            const {name, count, type} = counter
            return (
              <Counter
                type={type}
                key={name}
                name={name}
                count={count}
                increment={() => increment(name)}
                decrement={() => decrement(name)}
                setCount={func => updateCountForName(name, func)}
              />
            )
          }}
        />
      ) : (
        <button onClick={() => setIsShown(true)}>Show</button>
      )}
      <Summary counters={mappedCounters} />
    </div>
  )
}
