export function setProps(dom, oldProps, newProps) {
  for (let key in oldProps) {
    if (key !== 'children') {
      // 新的有，更新
      if (newProps.hasOwnProperty(key)) {
        setProp(dom, key, newProps[key])
      } else {
        // 新的没有，移除
        dom.removeAttribute(key)
      }
    }
  }
  for (let key in newProps) {
    if (key !== 'children') {
      // 老的没有，更新
      if (!oldProps.hasOwnProperty(key)) {
        setProp(dom, key, newProps[key])
      }
    }
  }
}

function setProp(dom, key, value) {
  if (/^on/.test(key)) { // onClick
    dom[key.toLowerCase()] = value
  } else if (key === 'style') {
    if (value) {
      for (let styleName in value) {
        dom.style[styleName] = value[styleName]
      }
    }
  } else {
    dom.setAttribute(key, value)
  }
}


export function sleep(time) {
  for (let start = Date.now(); Date.now() - start <= time;) {

  }
}

