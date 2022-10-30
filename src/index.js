import React from './react';
// import ReactDOM  from 'react-dom/client';
import ReactDOM from './react-dom';

const style = {
  border: '3px solid red',
  margin: '5px'
}

// const element = (
//   <div id="A1" style={style}>
//     A1 new
//     <div id="B1" style={style}>
//       B1 new
//       <div id="C1" style={style}>C1 new</div>
//       <div id="C2" style={style}>C2 new</div>
//     </div>
//     <div id="B2" style={style}>B2 new</div>
//     <div id="B3" style={style}>B3 new</div>
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
ReactDOM.render(element, document.getElementById('root'))

const render2 = document.getElementById('render2')
render2.addEventListener('click', () => {
  const element2 = /*#__PURE__*/React.createElement("div", {
    id: "A1",
    style: style
  }, "A1 new", /*#__PURE__*/React.createElement("div", {
    id: "B1",
    style: style
  }, "B1 new", /*#__PURE__*/React.createElement("div", {
    id: "C1",
    style: style
  }, "C1 new"), /*#__PURE__*/React.createElement("div", {
    id: "C2",
    style: style
  }, "C2 new")), /*#__PURE__*/React.createElement("div", {
    id: "B2",
    style: style
  }, "B2 new"), /*#__PURE__*/React.createElement("div", {
    id: "B3",
    style: style
  }, "B3 new"));
  ReactDOM.render(element2, document.getElementById('root'))
})

const render3 = document.getElementById('render3')
render3.addEventListener('click', () => {
  const element3 = /*#__PURE__*/React.createElement("div", {
    id: "A1",
    style: style
  }, "A1 --", /*#__PURE__*/React.createElement("div", {
    id: "B1",
    style: style
  }, "B1 --", /*#__PURE__*/React.createElement("div", {
    id: "C1",
    style: style
  }, "C1 --"), /*#__PURE__*/React.createElement("div", {
    id: "C2",
    style: style
  }, "C2")));
  ReactDOM.render(element3, document.getElementById('root'))
})
