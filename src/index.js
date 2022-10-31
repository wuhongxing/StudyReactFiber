import React from './react'
import ReactDOM from './react-dom'

class ClassCounter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { number: 0 }
  }
  onClick = () => {
    this.setState(state => {
      return { number: state.number + 1 }
    })
  }
  render() {
    return React.createElement("div", {
      id: "counter"
    }, /*#__PURE__*/React.createElement("span", null, this.state.number), /*#__PURE__*/React.createElement("button", {
      onClick: this.onClick
    }, "\u52A01"));
  }
}

const ADD = 'ADD'
function reducer(state, action) {
  switch (action.type) {
    case ADD:
      return { count: state.count + 1}
    default:
      return state
  }
}

function FunctionCounter() {
  const [countState, dispatch] = React.useReducer(reducer, { count: 0 })
  return React.createElement("div", {
    id: "counter"
  }, /*#__PURE__*/React.createElement("span", null, countState.count), /*#__PURE__*/React.createElement("button", {
    onClick: () => dispatch('ADD')
  }, "\u52A01"));
}

// ReactDOM.render(<ClassCounter />, document.getElementById('root'))
ReactDOM.render(<FunctionCounter />, document.getElementById('root'))
