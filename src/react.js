import { ELEMENT_TEXT } from "./constants"
// 创建元素(虚拟 DOM)
// type 类型 div span ...
// config 配置对象
// children 所有的儿子，这里会做成一个数组
// 如果 children 是一个文本，要做一下兼容
function createElement(type, config, ...children) {
  delete config.__self
  delete config.__source // 表示这个元素在哪行哪列哪个文件

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

const React = {
  createElement
}

export default React
