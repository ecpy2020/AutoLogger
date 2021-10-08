/**
 * @Module OverrideRequire
 */

const { getInternalKeys } = require('./utils.obj-keys-parser')

const Module = require('module')

const overriddenModuleCache = {}

function deleteRequireCache() {
  Object.keys(overriddenModuleCache).forEach(path => {
    delete require.cache[path]
  })
}

function parseModuleInfos(_module, requirePath) {
  // search in non-internal cache
  const module = Object.values(require.cache).find(
    cache => typeof cache.exports == typeof _module && cache.exports == _module
  )

  // search in internal cache
  const modulePath = module ? module.id : requirePath

  const infos = {
    modulePath,
    internal: !module,
  }

  return infos
}

let isModuleRequireOverridden = false

let originalModuleRequire
/**
 * handle require logic
 * @param {Function} requireHandler - ({modulePath, module, internal}) => module
 */
function overrideModuleRequireCall(requireHandler) {
  if (isModuleRequireOverridden) return

  isModuleRequireOverridden = true

  originalModuleRequire = Module.prototype.require

  Module.prototype.require = function (requirePath) {
    const module = originalModuleRequire.apply(this, arguments)

    const { modulePath, internal } = parseModuleInfos(module, requirePath)

    if (modulePath.includes('pointTransactionService')) {
      console.log('debug: submodule: overrideModuleRequireCall')
      console.log('this')
      console.log(module)
      console.log(this)
      console.log(requirePath)
      console.log(modulePath)
    }

    // set cache of both overridden or not
    if (isModuleRequireOverridden) {
      if (modulePath in overriddenModuleCache) return overriddenModuleCache[modulePath]

      const overriddenModule = requireHandler({
        modulePath,
        module,
        internal,
      })

      if (overriddenModule === module) {
        return module
      } else {
        overriddenModuleCache[modulePath] = overriddenModule

        return overriddenModule
      }
    } else {
      return module
    }
  }
}

function restoreModuleRequireCall() {
  if (!isModuleRequireOverridden) return

  isModuleRequireOverridden = false

  deleteRequireCache()

  Module.prototype.require = originalModuleRequire
}

module.exports = {
  restoreModuleRequireCall,
  overrideModuleRequireCall,
  parseModuleInfos, // private
}
