// 从根节点开始渲染和调度
// 两个阶段
// 1. diff/render 阶段，对比新旧的虚拟 DOM，进行增量更新或创建，render 阶段
// 这个阶段可能比较花时间，可以对我们的任务进行拆分，此阶段可以暂停
// render 阶段有两个任务: 1. 根据虚拟 DOM 生成 fiber 树（也会创建真实的 stateNode） 2. 收集 effectList
// 2. commit 阶段，根据收集到的 effectList 进行真实 DOM 的挂载，此阶段不能暂停

import { DELETION, ELEMENT_TEXT, PLACEMENT, TAG_HOST, TAG_ROOT, TAG_TEXT, UPDATE } from "./constants"
import { setProps } from "./utils"

// 下一个工作单元
let nextUnitOfWork = null
// RootFiber 应用的根
let workInProgressRoot = null
// 当前界面树f
let currentRoot = null
// 删除的节点并不放在 effect list 里，所以需要单独记录
let deletions = []
export function scheduleRoot(rootFiber) {
  if (currentRoot && currentRoot.alternate) { // 第二次及之后的更新
    workInProgressRoot = currentRoot.alternate
    workInProgressRoot.props = rootFiber.props
    workInProgressRoot.alternate = currentRoot
  } else if (currentRoot) { // 第一次更新
    rootFiber.alternate = currentRoot
    workInProgressRoot = rootFiber
  } else { // 初次渲染
    workInProgressRoot = rootFiber
  }

  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = workInProgressRoot.nextEffect = null
  nextUnitOfWork = workInProgressRoot
  requestIdleCallback(workLoop, { timeout: 500 })
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
    console.log('render 阶段结束，开始提交')
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
    // 创建 stateNode，并调和
    updateHost(currentFiber)
  }
}

// 在完成的时候要收集有副作用的 fiber，然后组成 effect list
// TODO: 这个是难点
// 每个 fiber 有两个属性，firstEffect 指向第一个有副作用的子 fiber，last effect 指向最后一个有副作用的子 fiber
// 中间用 nextEffect 做成一个单链表
// 这里会使用 firstEffect 和 lastEffect 把一个树变成一个单链表
function completeUnitOfWork(currentFiber) {
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
  // 如果当前 currentFiber 有 alternate 并且 alternate 有 child 属性
  let oldFiber = currentFiber.alternate && currentFiber.alternate.child
  let prevSibling // 上一个新的子fiber
  // 保证新旧一次遍历完
  while (newChildIndex < newChildren.length || oldFiber) {
    const newChild = newChildren[newChildIndex] // 取出元素节点
    const sameType = oldFiber && newChild && oldFiber.type === newChild.type
    let tag
    if (newChild && newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT // 文本结点
    } else if (newChild && typeof newChild.type === 'string') {
      tag = TAG_HOST // 原生 DOM 节点
    }
    // 可以复用老节点，更新即可
    let newFiber;
    if (sameType) {
      if (oldFiber.alternate) {
        newFiber = oldFiber.alternate // 如果有上上次的 fiber，就拿过来，作为这次的 fiber
        newFiber.props = newChild.props
        newFiber.alternate = oldFiber
        newFiber.effectTag = UPDATE
        newFiber.nextEffect = null
      } else {
        newFiber = {
          tag: oldFiber.tag,
          type: oldFiber.type,
          props: newChild.props,
          stateNode: oldFiber.stateNode,
          return: currentFiber,
          alternate: oldFiber,
          effectTag: UPDATE,
          nextEffect: null // effact list 也是一个单链表，顺序和完成顺序是一样的
        }
      }
    } else {
      if (newChild) {
        newFiber = {
          tag,
          type: newChild.type,
          props: newChild.props,
          stateNode: null,
          return: currentFiber,
          effectTag: PLACEMENT,
          nextEffect: null // effact list 也是一个单链表，顺序和完成顺序是一样的
        }
      }
      if (oldFiber) {
        oldFiber.effectTag = DELETION
        deletions.push(oldFiber)
      }
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling
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
  deletions.forEach(commitWork)

  let currentFiber = workInProgressRoot.firstEffect
  while (currentFiber) {
    commitWork(currentFiber)
    currentFiber = currentFiber.nextEffect
  }
  // 提交之后要清空 deletion 数组
  deletions.length = 0
  currentRoot = workInProgressRoot
  workInProgressRoot = null
}

function commitWork(currentFiber) {
  if (!currentFiber) return
  let returnFiber = currentFiber.return
  let returnDOM = returnFiber.stateNode
  // 新增节点
  if (currentFiber.effectTag === PLACEMENT) {
    returnDOM.appendChild(currentFiber.stateNode)
  } else if (currentFiber.effectTag === DELETION) {
    returnDOM.removeChild(currentFiber.stateNode)
  } else if (currentFiber.effectTag === UPDATE) {
    if (currentFiber.tag === TAG_TEXT) {
      if (currentFiber.alternate.props.text !== currentFiber.props.text) {
        currentFiber.stateNode.textContent = currentFiber.props.text
      }
    } else {
      updateDOM(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props)
    }
  }
  currentFiber.effectTag = null
}

// requestIdleCallback(workLoop, { timeout: 500 })
