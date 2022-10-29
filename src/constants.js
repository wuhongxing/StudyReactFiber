// 表示这是一个文本元素
export const ELEMENT_TEXT = Symbol.for('ELEMENT_TEXT')
// 根 fiber
export const TAG_ROOT = Symbol.for('TAG_ROOT')
// 原生节点 span/div/p 为了区分自定义组件
export const TAG_HOST = Symbol.for('TAG_HOST')
// 文本节点
export const TAG_TEXT = Symbol.for('TAG_TEXT')
// 副作用-插入节点
export const PLACEMENT = Symbol.for('PLACEMENT')
// 副作用-更新节点
export const UPDATE = Symbol.for('UPDATE')
// 副作用-删除节点
export const DELETION = Symbol.for('DELETION')


