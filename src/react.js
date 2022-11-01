import { ELEMENT_TEXT } from "./constants"
import { scheduleRoot, useReducer, useState } from "./scheduleRoot"
import { Update, UpdateQueue } from "./UpdateQueue"
// 创建元素(虚拟 DOM)
// type 类型 div span ...
// config 配置对象
// children 所有的儿子，这里会做成一个数组
// 如果 children 是一个文本，要做一下兼容
function createElement(type, config, ...children) {
  // delete config.__self
  // delete config.__source // 表示这个元素在哪行哪列哪个文件

  return { type, props: {
    ...config,
    children: children.map(child => {
      return typeof child === 'object' ? child : {
        type: ELEMENT_TEXT,
        props: { text: child, children: []}
      }
    })
  } }
}

class Component {
  constructor(props) {
    this.props = props
    this.updateQueue = new UpdateQueue()
  }
  setState(payload) {
    let update = new Update(payload)
    // updateQueue 其实是在放在此类组件对应的 firber 节点的 internalFiber 上
    this.internalFiber.updateQueue.enqueueUpdate(update)
    // this.updateQueue.enqueueUpdate(update)
    scheduleRoot()
  }
}

Component.prototype.isReactComponent = {} // 类组件

const React = {
  createElement,
  Component,
  useReducer,
  useState
}

export default React
