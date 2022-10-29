// 从根节点开始渲染和调度
// 两个阶段
// 1. diff/render 阶段，对比新旧的虚拟 DOM，进行增量更新或创建，render 阶段
// 这个阶段可能比较花时间，可以对我们的任务进行拆分，此阶段可以暂停
// render 阶段有两个任务: 1. 根据虚拟 DOM 生成 fiber 树 2. 收集 effectList
// 2. commit 阶段，进行真实 DOM 的创建更新，此阶段不能暂停

import { ELEMENT_TEXT, PLACEMENT, TAG_HOST, TAG_ROOT, TAG_TEXT } from "./constants"
import { setProps, sleep } from "./utils"

// 下一个工作单元
let nextUnitOfWork = null
// RootFiber 应用的根
let workInProgressRoot = null

function scheduleRoot(rootFiber) {
  workInProgressRoot = rootFiber
  nextUnitOfWork = rootFiber
}

function workLoop(deadline) {
  // 是否需要让出时间片
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if (nextUnitOfWork) {
    requestIdleCallback(workLoop, { timeout: 500 })
  }
  if (!nextUnitOfWork && workInProgressRoot) {
    console.log('render 阶段结束')
    commitRoot()
  }
}

function performUnitOfWork(currentFiber) {
  beginWork(currentFiber)
  if (currentFiber.child) {
    return currentFiber.child
  }
  while (currentFiber) {
    completeUnitOfWork(currentFiber)
    if (currentFiber.sibling) {
      return currentFiber.sibling
    }
    currentFiber = currentFiber.return
  }
}

function beginWork(currentFiber) {
  if (currentFiber.tag === TAG_ROOT) {
    // 仅调和
    updateHostRoot(currentFiber)
  } else if (currentFiber.tag === TAG_TEXT) {
    // 仅创建 stateNode
    updateHostText(currentFiber)
  } else if (currentFiber.tag === TAG_HOST) {
    // 创建 stateNode，并调和 children
    updateHost(currentFiber)
  }
}

// 在完成的时候要收集有副作用的 fiber，然后组成 effect list
// TODO: 这个是难点
// 每个 fiber 有两个属性，firstEffect 指向第一个有副作用的子 fiber，last effect 指向最后一个有副作用的子 fiber
// 中间用 nextEffect 做成一个单链表
function completeUnitOfWork(currentFiber) {
  console.log(currentFiber)
  let returnFiber = currentFiber.return
  if (returnFiber) {
    // 把自己儿子的 effect 链挂到父亲身上
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect
    }
    if (!!currentFiber.lastEffect) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect
      }
      returnFiber.lastEffect = currentFiber.lastEffect
    }

    // 把自已挂到父亲身上
    const effectTag = currentFiber.effectTag
    if (effectTag) { // 说明自己有副作用
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber
      } else {
        returnFiber.firstEffect = currentFiber
      }
      returnFiber.lastEffect = currentFiber
    }
  }
}

function updateHost(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
  const newChildren = currentFiber.props.children
  reconclieChildren(currentFiber, newChildren)
}

function updateHostText(currentFiber) {
  // 如果此 fiber 没有创建 DOM 节点
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDOM(currentFiber)
  }
}

function updateHostRoot(currentFiber) {
  // 先处理自己，如果是一个原生节点，创建真实 DOM
  // 创建 fiber
  let newChildren = currentFiber.props.children
  reconclieChildren(currentFiber, newChildren)
}

function createDOM(currentFiber) {
  if (currentFiber.tag === TAG_TEXT) {
    return document.createTextNode(currentFiber.props.text)
  } else if (currentFiber.tag === TAG_HOST) {
    let stateNode = document.createElement(currentFiber.type)
    updateDOM(stateNode, {}, currentFiber.props)
    return stateNode
  }
}

function updateDOM(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps)
}

// newChildren 就是一个虚拟 DOM 数组，协调的时候会转成 fiber 节点
function reconclieChildren(currentFiber, newChildren) {
  let newChildIndex = 0 // 新子节点的索引
  let prevSibling // 上一个新的子fiber
  while (newChildIndex < newChildren.length) {
    const newChild = newChildren[newChildIndex] // 取出元素节点
    let tag
    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT // 文本结点
    } else if (typeof newChild.type === 'string') {
      tag = TAG_HOST // 原生 DOM 节点
    }
    let newFiber = {
      tag,
      type: newChild.type,
      props: newChild.props,
      stateNode: null,
      return: currentFiber,
      effectTag: PLACEMENT,
      nextEffect: null // effact list 也是一个单链表，顺序和完成顺序是一样的
    }
    if (newFiber) {
      if (newChildIndex === 0) {
        currentFiber.child = newFiber
      } else {
        prevSibling.sibling = newFiber
      }
      prevSibling = newFiber
    }
    newChildIndex ++
  }
}

function commitRoot() {
  let currentFiber = workInProgressRoot.firstEffect
  while (currentFiber) {
    commitWork(currentFiber)
    currentFiber = currentFiber.nextEffect
  }
  workInProgressRoot = null
}

function commitWork(currentFiber) {
  if (!currentFiber) return
  let returnFiber = currentFiber.return
  let returnDOM = returnFiber.stateNode
  if (currentFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode)
  }
  currentFiber.effectTag = null
}

requestIdleCallback(workLoop, { timeout: 500 })

export default scheduleRoot
