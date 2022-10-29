import React from './react';
// import ReactDOM  from 'react-dom/client';
import ReactDOM from './react-dom';

const style = {
  border: '3px solid red',
  margin: '5px'
}

// const element = (
//   <div id="A1" style={style}>
//     A1
//     <div id="B1" style={style}>
//       B1
//       <div id="C1" style={style}>C1</div>
//       <div id="C2" style={style}>C2</div>
//     </div>
//     <div id="B2" style={style}>B2</div>
//   </div>
// )

const element = /*#__PURE__*/React.createElement("div", {
  id: "A1",
  style: style
}, "A1", /*#__PURE__*/React.createElement("div", {
  id: "B1",
  style: style
}, "B1", /*#__PURE__*/React.createElement("div", {
  id: "C1",
  style: style
}, "C1"), /*#__PURE__*/React.createElement("div", {
  id: "C2",
  style: style
}, "C2")), /*#__PURE__*/React.createElement("div", {
  id: "B2",
  style: style
}, "B2"));

// const root = ReactDOM.createRoot(document.getElementById('root'))
// root.render(element)
console.log(element)
ReactDOM.render(element, document.getElementById('root'))

