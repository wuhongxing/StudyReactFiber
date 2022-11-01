import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'

let lastDependencies
function useEffect(callback, dependencies) {
  if (lastDependencies) {
    let changed = !dependencies.every((item, index) => {
      return item === lastDependencies[index]
    })
    if (changed) {
      callback()
      lastDependencies = dependencies
    }
  } else {
    callback()
    lastDependencies = dependencies
  }
}

function Counter() {
  const [name, setName] = useState('hongxing')
  const [number, setNumber] = useState(0)

  useEffect(() => {
    console.log(number)
  }, [number])

  return (
    <div>
      <p>{name}</p>
      <p>{number}</p>
      <button onClick={() => setName(Date.now() + '')}>修改名称</button>
      <button onClick={() => setNumber(number + 1)}>修改名称</button>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Counter />)
