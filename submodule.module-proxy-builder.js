/**
 *  @Module class and raw function proxy builder
 */

const _ = require('lodash')

const { isClass, isFunction } = require('./utils.check-obj-type')

const { getClassFunctionKeys } = require('./utils.obj-keys-parser')

const { DEBUG, debugLog } = require('./config')

const EVENT = {
  CLASS_CONSTRUCTOR_FUNCTION_CALL_START: 'CLASS_CONSTRUCTOR_FUNCTION_CALL_START',
  CLASS_CONSTRUCTOR_FUNCTION_CALL_RETURN: 'CLASS_CONSTRUCTOR_FUNCTION_CALL_RETURN',
  CLASS_CONSTRUCTOR_FUNCTION_CALL_ERROR: 'CLASS_CONSTRUCTOR_FUNCTION_CALL_ERROR',
  CLASS_INSTANCE_FUNCTION_CALL_START: 'CLASS_INSTANCE_FUNCTION_CALL_START',
  CLASS_INSTANCE_FUNCTION_CALL_ERROR: 'CLASS_INSTANCE_FUNCTION_CALL_ERROR',
  CLASS_INSTANCE_FUNCTION_CALL_SYNC_RETURN: 'CLASS_INSTANCE_FUNCTION_CALL_SYNC_RETURN',
  CLASS_INSTANCE_FUNCTION_CALL_ASYNC_RETURN: 'CLASS_INSTANCE_FUNCTION_CALL_ASYNC_RETURN',
  CLASS_STATIC_FUNCTION_CALL_START: 'CLASS_STATIC_FUNCTION_CALL_START',
  CLASS_STATIC_FUNCTION_CALL_ERROR: 'CLASS_STATIC_FUNCTION_CALL_ERROR',
  CLASS_STATIC_FUNCTION_CALL_SYNC_RETURN: 'CLASS_STATIC_FUNCTION_CALL_SYNC_RETURN',
  CLASS_STATIC_FUNCTION_CALL_ASYNC_RETURN: 'CLASS_STATIC_FUNCTION_CALL_ASYNC_RETURN',
  RAW_FUNCTION_CALL_START: 'RAW_FUNCTION_CALL_START',
  RAW_FUNCTION_CALL_ERROR: 'RAW_FUNCTION_CALL_ERROR',
  RAW_FUNCTION_CALL_SYNC_RETURN: 'RAW_FUNCTION_CALL_SYNC_RETURN',
  RAW_FUNCTION_CALL_ASYNC_RETURN: 'RAW_FUNCTION_CALL_ASYNC_RETURN',
  FRAMEWORK_ERROR: 'FRAMEWORK_ERROR',
}

// for generating unique id
const idCounter = {
  idSet: new Set([0]),
  genId() {
    return Math.round(Math.random() * Number.MAX_SAFE_INTEGER)
  },
  getNextId: function () {
    let id = 0
    while (idCounter.idSet.has(id)) {
      id = idCounter.genId()
    }
    idCounter.idSet.add(id)
    return id
  },
}

// get locale time string
function getLocaleTimeString() {
  return new Date().toString()
}

// extends class by function
function extendsClass(baseClass, parentClass) {
  baseClass.__proto__ = parentClass
}

// inherit static properties
function inheritClassStaticProperties(classA, classB) {
  Object.keys(classB).forEach(key => {
    const value = classB[key]

    // assign name to function
    if (isFunction(value)) {
      const func = value

      func.name = func.name ? func.name : key
    }

    classA[key] = value
  })
}

// execute function, intercept error and re-throw
function executeFunctionAndInterceptError(func, errorCallback) {
  try {
    const result = func()

    return result instanceof Promise
      ? result.catch(err => {
          errorCallback && errorCallback(err)
          throw err
        })
      : result
  } catch (err) {
    errorCallback && errorCallback(err)

    throw err
  }
}

/**
 * @param {object} object
 * @param {function} frameworkEventCallback: ({ eventType, className, functionName, functionArguments }) => {}
 */
function buildObjectProxyWithCallback(object, frameworkEventCallback) {
  if (!object) return void 'AUTO_LOGGER_2020'

  if (!frameworkEventCallback) return object

  // only proxy first layer
  getClassFunctionKeys(object).forEach(key => {
    debugLog('buildObjectProxyWithCallback', `@key: ${key}`)

    // proxy function only
    object[key] = buildFunctionProxyWithCallback({
      functionKey: key,
      func: object[key],
      frameworkEventCallback,
    })
  })

  return object
}

/**
 * @param {class} _class
 * @param {function} frameworkEventCallback: ({ eventType, className, functionName, functionArguments, error }) => {}
 */
function buildClassProxyWithCallback({ modulePath, _class, frameworkEventCallback }) {
  if (!_class) return void 'AUTO_LOGGER_2020'

  if (!frameworkEventCallback) return _class

  const parentClass = Object.getPrototypeOf(_class)

  const className = _class.name

  // override the class constructor
  let ProxyClass = class {
    constructor(...args) {
      const classInstanceId = 'classInstanceId@' + idCounter.getNextId()

      const functionStartTime = new Date()

      debugLog('buildClassProxyWithCallback', 'ProxyClass#constructor', { args })

      frameworkEventCallback({
        eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_START,
        eventTime: getLocaleTimeString(),
        className: _class.name,
        classInstanceId,
        functionName: 'constructor',
        functionArguments: args,
        modulePath,
      })

      let instance = executeFunctionAndInterceptError(
        () => new _class(...args),
        error => {
          debugLog('buildClassProxyWithCallback', 'instance#executeFunctionAndInterceptError', { error })

          frameworkEventCallback({
            eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_ERROR,
            eventTime: getLocaleTimeString(),
            className: _class.name,
            classInstanceId,
            functionName: 'constructor',
            functionError: error,
            modulePath,
          })
        }
      )

      instance = buildObjectProxyWithCallback(instance, objectProxyCallbackEvent => 
        frameworkEventCallback({
          ...objectProxyCallbackEvent,
          className: _class.name,
          classInstanceId,
          // map to class proxy event
          eventType: {
            [EVENT.RAW_FUNCTION_CALL_START]: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
            [EVENT.RAW_FUNCTION_CALL_SYNC_RETURN]:
              EVENT.CLASS_INSTANCE_FUNCTION_CALL_SYNC_RETURN,
            [EVENT.RAW_FUNCTION_CALL_ASYNC_RETURN]:
              EVENT.CLASS_INSTANCE_FUNCTION_CALL_ASYNC_RETURN,
            [EVENT.RAW_FUNCTION_CALL_ERROR]: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ERROR,
          }[objectProxyCallbackEvent.eventType],
          modulePath,
        })
      )

      frameworkEventCallback({
        eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_RETURN,
        className: _class.name,
        eventTime: getLocaleTimeString(),
        classInstanceId,
        functionName: 'constructor',
        functionReturn: instance,
        functionExecutionTime: (Date.now() - functionStartTime) / 1000 + ' seconds',
        modulePath,
      })

      return instance
    }
  }

  // assign back the class name
  Object.defineProperty(ProxyClass, 'name', {
    value: className,
  })

  // extend parent class
  if (parentClass) extendsClass(ProxyClass, parentClass)

  // inherit back all static properties
  inheritClassStaticProperties(ProxyClass, _class)

  // proxy static properties
  ProxyClass = buildObjectProxyWithCallback(ProxyClass, objectProxyCallbackEvent =>
    frameworkEventCallback({
      ...objectProxyCallbackEvent,
      className: _class.name,
      // map to class proxy event
      eventType: {
        [EVENT.RAW_FUNCTION_CALL_START]: EVENT.CLASS_STATIC_FUNCTION_CALL_START,
        [EVENT.RAW_FUNCTION_CALL_SYNC_RETURN]:
          EVENT.CLASS_STATIC_FUNCTION_CALL_SYNC_RETURN,
        [EVENT.RAW_FUNCTION_CALL_ERROR]: EVENT.CLASS_STATIC_FUNCTION_CALL_ERROR,
      }[objectProxyCallbackEvent.eventType],
      modulePath,
    })
  )

  return ProxyClass
}

/**
 * @param {string} functionName - name of the function
 * @param {function} func - the function
 * @param {function} frameworkEventCallback - ({ eventType, functionName, functionArguments }) => {...}
 */
function buildFunctionProxyWithCallback({
  modulePath,
  functionName,
  functionKey,
  func,
  frameworkEventCallback,
}) {
  if (!func) return void 'AUTO_LOGGER_2020'

  if (!frameworkEventCallback) return func

  func.name = func.name || functionName || functionKey || 'function'

  functionName = func.name

  debugLog('buildFunctionProxyWithCallback', `#${functionName}: start proxy`)

  const proxyFunction = new Proxy(func, {
    apply: (func, thisArg, argArray) => {
      const functionCallId = 'functionCallId@' + idCounter.getNextId()

      const functionStartTime = new Date()

      frameworkEventCallback({
        eventType: EVENT.RAW_FUNCTION_CALL_START,
        eventTime: getLocaleTimeString(),
        functionArguments: argArray,
        functionKey,
        functionName,
        functionCallId,
        functionStartTime: functionStartTime.toString(),
        modulePath,
      })

      debugLog('buildFunctionProxyWithCallback', `#${functionName}: start call`, argArray)

      const result = executeFunctionAndInterceptError(
        () => {
          func = thisArg ? func.bind(thisArg) : func

          return func(...argArray)
        },
        error => {

          debugLog('buildFunctionProxyWithCallback', `#${functionName}: error`, error)

          frameworkEventCallback({
            eventType: EVENT.RAW_FUNCTION_CALL_ERROR,
            eventTime: getLocaleTimeString(),
            functionName,
            functionKey,
            functionCallId,
            functionError: error,
            functionExecutionTime: (Date.now() - functionStartTime) / 1000 + ' seconds',
            modulePath,
          })
        }
      )

      debugLog('buildFunctionProxyWithCallback', `#${functionName}: return`, result)

      function processResult(result, sync) {
        frameworkEventCallback({
          eventType: sync
            ? EVENT.RAW_FUNCTION_CALL_SYNC_RETURN
            : EVENT.RAW_FUNCTION_CALL_ASYNC_RETURN,
          eventTime: getLocaleTimeString(),
          functionName,
          functionKey,
          functionCallId,
          functionExecutionTime: (Date.now() - functionStartTime) / 1000 + ' seconds',
          functionReturn: result,
          modulePath,
        })
        return result
      }

      return result instanceof Promise
        ? result.then(result => processResult(result, false))
        : processResult(result, true)
    },
  })

  debugLog('buildFunctionProxyWithCallback', `#${functionName}: finish proxy`)

  return proxyFunction
}

const __AUTO_LOGGER_PROXY_PROCESSED_MARK___ = '__AUTO_LOGGER_PROXY_PROCESSED___'

const processedPool = new Set()

function markTargetBeingProcessed(target) {
  processedPool.add(target)

  // @depreciated: as Object.defineProperties may not work in all cases
  // Object.defineProperties(target, {
  //   [__AUTO_LOGGER_PROXY_PROCESSED_MARK___]: {
  //     value: true,
  //     enumerable: false,
  //   },
  // })
}

function isTargetAlreadyProcessed(target) {
  return processedPool.has(target)

  // @depreciated: as Object.defineProperties may not work in all cases
  // return target[__AUTO_LOGGER_PROXY_PROCESSED_MARK___]
}

/**
 * build a proxy on the module
 * @param {object} module - node module
 * @param {function} classTargetProxy - (target: class) => class
 * @param {function} functionTargetProxy - (target: function) => function
 */
function buildModuleProxy(module, { buildFunctionProxy, buildClassProxy }) {
  debugLog('buildModuleProxy', '#start')

  // check if it is primitive types
  if (!_.isObject(module)) return module

  const proxySetter = ({ key, target }) => {
    debugLog('buildModuleProxy', '#proxySetter', { key })

    // avoid to re-proxy
    if (isTargetAlreadyProcessed(target)) return target

    let proxyObj

    if (isFunction(target)) {
      proxyObj = buildFunctionProxy({ key, target })
    }

    if (isClass(target)) {
      proxyObj = buildClassProxy({ target })
    }

    markTargetBeingProcessed(proxyObj)

    return proxyObj
  }

  return traverseObjectAndProxyTarget({
    obj: module,
  })

  function traverseObjectAndProxyTarget({ key, obj, callback }) {
    debugLog('buildModuleProxy', '#traverseObjectAndProxyTarget', { key })

    // check if class or function
    if (_.isFunction(obj)) {
      if (isTargetAlreadyProcessed(obj)) return obj

      const proxyObj = proxySetter({ key, target: obj })

      return callback ? callback(proxyObj) : proxyObj
    }

    // avoid circular reference
    markTargetBeingProcessed(obj)

    _.forOwn(obj, (val, key) => {
      // avoid circular reference
      if (isTargetAlreadyProcessed(val)) return

      if (_.isArray(val)) {
        const arr = val

        function attachProxyTargetOnArray(index) {
          return proxyTarget => (arr[index] = proxyTarget)
        }

        arr.forEach((i, e) => {
          traverseObjectAndProxyTarget({ obj: e, callback: attachProxyTargetOnArray(i) })
        })
      } else if (_.isObject(val)) {
        function attachProxyTargetOnObject(key) {
          return proxyTarget => (obj[key] = proxyTarget)
        }

        traverseObjectAndProxyTarget({
          key,
          obj: val,
          callback: attachProxyTargetOnObject(key),
        })
      }
    })

    return obj
  }
}

/**
 * - iterate the internal module seems throwing unexpected errors
 *
 * @usage mark target's functions being visited to avoid them to be revisited
 *
 * @param {object} module - node module
 */
function markModuleVisited(module) {
  debugLog('markModuleVisited', '#start')

  // check if it is primitive types
  if (!_.isObject(module)) return module

  const markTarget = ({ target }) => {
    if (isTargetAlreadyProcessed(target)) return target

    markTargetBeingProcessed(target)

    return target
  }

  return traverseObjectAndMarkTarget({
    obj: module,
  })

  function traverseObjectAndMarkTarget({ obj, callback }) {
    debugLog('markModuleVisited', '#traverseObjectAndMarkTarget')

    // check if class or function
    if (_.isFunction(obj)) {
      if (isTargetAlreadyProcessed(obj)) return obj

      const markedTarget = markTarget({ target: obj })

      return callback ? callback(markedTarget) : markedTarget
    }

    // avoid circular reference
    markTargetBeingProcessed(obj)

    // TODO: here iterates the obj will throw unexpected error
    _.forOwn(obj, (val, key) => {
      // avoid circular reference
      if (isTargetAlreadyProcessed(val)) return

      if (_.isArray(val)) {
        const arr = val

        function attachMarkedTargetOnArray(index) {
          return targetMarked => (arr[index] = targetMarked)
        }

        arr.forEach((i, e) => {
          traverseObjectAndMarkTarget({ obj: e, callback: attachMarkedTargetOnArray(i) })
        })
      } else if (_.isObject(val)) {
        function attachMarkedTargetOnObject(key) {
          return targetMarked => (obj[key] = targetMarked)
        }

        traverseObjectAndMarkTarget({
          obj: val,
          callback: attachMarkedTargetOnObject(key),
        })
      }
    })

    return obj
  }
}

function markTargetDisabledByDynamicProxy(target, frameworkEventCallback) {
  // not handling primitive types
  if (!_.isObject(target)) return target

  {
    // avoid repeatable works
    if (isTargetAlreadyProcessed(target)) return target

    markTargetBeingProcessed(target)
  }

  {
    // only proxy proxiable target, temp. work around using try{..}catch{...}
    try {
      // TODO: handling unproxiable frozen object
      if (Object.isFrozen(target)) {
        return target
      }

      const proxy = new Proxy(target, {
        // get: function (target, prop, receiver) {
        //   if (descriptor && descriptor.writeable) {
        //     return markTargetDisabledByDynamicProxy(target[prop])
        //   }else{
        //     return target[prop]
        //   }
        // },
      })

      return proxy
    } catch (err) {
      frameworkEventCallback({
        eventType: EVENT.FRAMEWORK_ERROR,
        error: err,
        eventTime: getLocaleTimeString(),
        target: target,
        functionName: 'markTargetDisabledByDynamicProxy',
      })

      return target
    }
  }
}

/**
 * mark the proxy actions of the module proxy are disabled
 */
function disableModuleProxyActions(module) {
  return markTargetDisabledByDynamicProxy(module)
}

module.exports = {
  EVENT,
  markModuleVisited: module => markModuleVisited(module), // not used yet
  buildModuleProxy: (module, modulePath, frameworkEventCallback) =>
    buildModuleProxy(module, {
      buildFunctionProxy: ({ key, target }) =>
        buildFunctionProxyWithCallback({
          modulePath,
          functionKey: key,
          func: target,
          frameworkEventCallback,
        }),
      buildClassProxy: ({ target }) =>
        buildClassProxyWithCallback({
          modulePath,
          _class: target,
          frameworkEventCallback,
        }),
    }),
  disableModuleProxyActions: module => disableModuleProxyActions(module), // not used yet
}
