/**
 * shallowReactive（浅劫持，浅监视，浅响应数据）与 reactive（深的）
 */

// 定义一个 reactiveHandler 处理对象
const reactiveHandler = {
  // 获取属性值
  get(target, prop) {
    if (prop === '_is_reactive') return true // 判断是不是 reactive 对象
    const result = Reflect.get(target, prop)
    console.log('拦截了读取数据', prop, result)
    return result
  },
  // 修改属性值或添加属性
  set(target, prop, value) {
    const result = Reflect.set(target, prop, value)
    console.log('拦截了修改数据或添加属性', prop, value)
    return result
  },
  // 删除某个属性
  deleteProperty(target, prop) {
    const result = Reflect.deleteProperty(target, prop)
    console.log('拦截了删除数据', prop)
    return result
  }
}

// 定义一个 shallowReactive 函数，传入一个目标对象
function shallowReactive(target) {
  // 判断当前的目标对象是不是 object 类型（对象/数组）
  if (target && typeof target === 'object') {
    return new Proxy(target, reactiveHandler)
  }
  // 如果传入的数据是基本类型的数据，那么就直接返回
  return target
}

// 定义一个 reactive 函数，传入一个目标对象
function reactive(target) {
  // 判断当前的目标对象是不是 object 类型（对象/数组）
  if (target && typeof target === 'object') {
    // 对数组或对象中所有的数据进行 reactive 的递归处理
    // 先判断当前的数据是不是数组
    if (Array.isArray(target)) {
      // 数组的数据要进行遍历操作
      target.forEach((item, index) => {
        target[index] = reactive(item)
      })
    } else {
      // 再判断当前的数据是不是对象
      // 对象的数据要进行遍历操作
      Object.keys(target).forEach(key => {
        target[key] = reactive(target[key])
      })
    }
    return new Proxy(target, reactiveHandler)
  }
  // 如果传入的数据是基本类型的数据，那么就直接返回
  return target
}

// ===============================================

/**
 * shallowReadonly（浅只读） 与 readonly（深只读）
 */

// 定义一个 readonlyHandler 处理器
const readonlyHandler = {
  get(target, prop) {
    if (prop === '_is_readonly') return true // 判断是不是 readonly 对象
    const result = Reflect.get(target, prop)
    console.log('拦截到了读取数据', prop, result)
    return result
  },
  set(target, prop, value) {
    console.warn('只能读取数据，不能修改数据或者添加数据')
    return true
  },
  deleteProperty(target, prop) {
    console.warn('只能读取数据，不能删除数据')
    return true
  }
}

// 定义一个 shallowReadonly 函数
function shallowReadonly(target) {
  // 需要判断当前的数据是不是对象
  if (target && typeof target === 'object') {
    return new Proxy(target, readonlyHandler)
  }
  return target
}

// 定义一个 readonly 函数
function readonly(target) {
  // 需要判断当前的数据是不是对象
  if (target && typeof target === 'object') {
    // 判断 target 是不是数组
    if (Array.isArray(target)) {
      // 遍历数组
      target.forEach((item, index) => {
        target[index] = readonly(item)
      })
    } else { // 判断 target 是不是对象
      // 遍历对象
      Object.keys(target).forEach(key => {
        target[key] = readonly(target[key])
      })
    }
    return new Proxy(target, readonlyHandler)
  }
  // 如果不是对象或者数组，那么直接返回
  return target
}

// ===============================================

/**
 * shallowRef（浅劫持，浅监视）与 ref（深的）
 * 注意：访问或操作数据时需要以 .value 的方式
 */

// 定义一个 shallowRef 函数
function shallowRef(target) {
  return {
    // 保存 target 数据
    _value: target,
    get value() {
      console.log('劫持到了读取数据')
      return this._value
    },
    set value(val) {
      console.log('劫持到了修改数据，等待更新界面', val)
      this._value = val
    }
  }
}

// 定义一个 ref 函数
function ref(target) {
  target = reactive(target)
  return {
    // 标识当前对象是 ref 对象
    _is_ref: true,
    // 保存 target 数据
    _value: target,
    get value() {
      console.log('劫持到了读取数据')
      return this._value
    },
    set value(val) {
      console.log('劫持到了修改数据，等待更新界面', val)
      this._value = val
    }
  }
}

// ===============================================

// 定义一个函数 isRef，判断当前的对象是不是 ref 对象
function isRef(obj) {
  return obj && obj._is_ref
}

// 定义一个函数 isReactive，判断当前的对象是不是 reactive 对象
function isReactive(obj) {
  return obj && obj._is_reactive
}

// 定义一个函数 isReadonly，判断当前的对象是不是 readonly 对象
function isReadonly(obj) {
  return obj && obj._is_readonly
}

// 定义一个函数 isProxy，判断当前的对象是不是 reactive 或 readonly 对象
function isProxy(obj) {
  return isReactive(obj) || isReadonly(obj)
}
