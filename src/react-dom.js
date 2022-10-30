import { TAG_ROOT } from './constants'
import { scheduleRoot } from './scheduleRoot'
// container: root dom 节点
function render(element, container) {
  const rootFiber = {
     tag: TAG_ROOT, // 标识 fiber 节点的类型
     stateNode: container, // 一般情况下，如果这个元素是一个原生节点，stateNode 指向真实的 DOM 元素
     props: {
      children: [element] // 这个fiber的属性对象children属性，里面放的是要渲染的元素
     }
  }
  scheduleRoot(rootFiber)
}

const ReactDOM = {
  render
}

export default ReactDOM
