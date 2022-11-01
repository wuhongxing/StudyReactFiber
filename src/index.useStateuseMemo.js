import React, { memo, useRef } from "react";
import ReactDOM from 'react-dom/client'

// 就是把所有的值都有数组按顺序存下来，当函数再次被执行的时候，会按次序把所有的值再次赋上
// 所以我们是绝对不可以在 while 和 if 中写
// render 过后要把所有的 index 清空，让下次计数准确
let lastStates = []
let index = 0
function useReducer(reducer, initialState) {
  lastStates[index] = lastStates?.[index] ?? initialState
  // 需要将当前的全局变量捕获到函数内部，不然后期这个值一值变化就没法对了
  const currentIndex = index
  function dispatch(action) {
    if (reducer) {
      lastStates[currentIndex] = reducer(lastStates[currentIndex], action)
    } else {
      lastStates[currentIndex] = action
    }
    render()
  }
  return [lastStates[index ++], dispatch]
}

function useState(initialState) {
  return useReducer(null, initialState)
}

let lastDeps = [];
let depsIndex = 0
function useMemo(action, deps) {
  if (deps?.length === 0 && !lastStates[index]) {
    lastStates[index] = action()
  } else {
    const isChanged = !deps?.every((item, _index) => item === lastDeps?.[depsIndex]?.[_index])
    if (isChanged) {
      lastStates[index] = action()
    }
    lastDeps[depsIndex ++] = deps
  }
  return lastStates[index ++]
}

function useCallback(action, deps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => action, deps)
}

function reducer(state, action) {
  if (action.type === 'add') {
    return state + 2
  }
  return state
}

function Counter() {
  const [state, setState] = useState(10)
  const [state1, dispatch] = useReducer(reducer, 20)
  const memoTest = useMemo(() => {
    console.log('state 发生改变了，重新计算')
    return `computed${state}`
  }, [])
  const memoTest1 = useMemo(() => {
    // console.log('state1 发生改变了，重新计算')
    return `computed${state1}`
  }, [state1])
  const ref = useRef(0)
  const ref1 = useRef(10)
  const onClick = useCallback(() => {
    console.log('执行了', ref.current, ref1.current)
  }, [])

  return (
    <>
      <p style={{'color': 'red'}}>{state}</p>
      <p style={{'color': 'blue'}}>{state1}</p>
      <p style={{'color': 'blue'}}>{memoTest}</p>
      <p style={{'color': 'blue'}}>{memoTest1}</p>
      <MChild onClick={onClick} />
      <button onClick={() => setState(state + 1)}>加1</button>
      <button onClick={() => dispatch({type: 'add'})}>加1</button>
      <button onClick={() => {
        ref.current = ref.current + 1
        console.log(ref.current)
      }}>test ref</button>
      <button onClick={() => {
        ref1.current = ref1.current + 1
        console.log(ref1.current)
      }}>test ref</button>
    </>
  )
}

function Child({onClick}) {
  console.log('child render')
  return <button onClick={onClick}>测试</button>
}
const MChild = memo(Child)

const root = ReactDOM.createRoot(document.getElementById('root'))
function render() {
  root.render(<Counter />)
  index = 0
  depsIndex = 0
}

render()


