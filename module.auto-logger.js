/**
 *  AutoLogger
 *
 *  temp. use as a lib POC in payment-service-backend, will migrate to .ts after it is stabled and enriched features
 *
 */

/**
 * - logics:
 *  - loading config
 *  - override require
 *  - parsing desired paths
 *  - proxy the module tree
 *  - proxy callback
 *      - inject execution contexts
 *      - inject module, target types: (class | function), function names, argument
 *  - event streaming to logger
 */

const Rx = require('rxjs')
const { filter } = require('rxjs/operators')
const {
  overrideModuleRequireCall,
  restoreModuleRequireCall,
} = require('./submodule.override-module-require')
const { testGlobPattern } = require('./utils.test-glob-pattern')
const {
  EVENT,
  buildModuleProxy,
  markModuleVisited,
} = require('./submodule.module-proxy-builder')

const { debugLog } = require('./config')

EVENT.MODULE_REQUIRED = 'MODULE_REQUIRED'
EVENT.MODULE_PROCESSED = 'MODULE_PROCESSED'

/**
 * module config
 */

let _config
let _fileGlobPatterns = ['**']
let _logger = console.log
let _tagger = obj => obj
let _isLoggerEnabled = false

/**
 * helpers
 */

/**
 * config the main module and override the default config
 * @param {Object} config
 */
function config(config) {
  // default config
  const defaultConfig = {
    // asyncLogging: true?
    logger: msg => console.log(msg),
    // setLogSessionId: function?
    attachTags: tagger => tagger,
  }

  _config = {
    ...defaultConfig,
    ..._config,
    ...config,
  }

  loadConfig(_config)
}

function loadConfig(config) {
  if (!config) return

  _fileGlobPatterns = config.files ? config.files : _fileGlobPatterns

  _logger = config.logger ? config.logger : _logger

  _tagger = config.tagger ? config.tagger : _tagger
}

function logEvent(event) {
  try {
    // try user defined logger
    _logger(event)
  } catch (err) {
    console.log(err)
    console.log(event)
  }
}

function processTags(obj) {
  _tagger(obj)
}

function serializeArguments(event) {
  const serializedKeys = ['functionArguments', 'functionReturn']

  serializedKeys.forEach(key => {
    try {
      event[key] = JSON.stringify(event[key], null, 2)
    } catch (err) {
      debugLog('serializeArguments', '#JSON.stringify', err)
    }
  })

  return event
}

const _ = require('lodash')
function formatEvent(event) {
  event = _.pickBy(event, _.identity)

  return event
}

function processAndLogEvent(event) {
  if (!_isLoggerEnabled) return

  // add framework tags
  event['tags'] = { framework: 'AUTO_LOGGER_2020' }

  // TODO: provide hooks to set custom tags
  /**
   * - attach the app git versions
   * - attach custom tags
   * - set context id: request id, etc
   */
  processTags(event['tags'])

  // TODO: framework defaults
  try {
    event = serializeArguments(event)

    event = formatEvent(event)

    logEvent(event)

    // hide hidden arguments

    // serialize arguments
  } catch (err) {
    debugLog('processAndLogEvent', 'serializeArguments | formatEvent | logEvent', err)
  }
}

// get locale time string
function getLocaleTimeString() {
  return new Date().toString()
}

/**
 * logger attach and restore
 */

const attachLoggers = () =>
  // TODO: may have extra configs
  {
    _isLoggerEnabled = true

    const moduleProxyCache = {}

    overrideModuleRequireCall(({ modulePath, module, internal }) => {
      if (testGlobPattern(_fileGlobPatterns, modulePath)) {
        // get cache
        if (moduleProxyCache[modulePath]) return moduleProxyCache[modulePath]

        if(modulePath.includes('pointTransactionService')){

        console.log('debug: module.auto-logger: overrideModuleRequireCall')
        console.log(modulePath)
        console.log(module)

        }

        moduleProxyCache[modulePath] = buildModuleProxy(
          module,
          modulePath,
          processAndLogEvent
        )

        // @depreciated: not log require event for higher app start speed
        processAndLogEvent({
          eventType: [EVENT.MODULE_REQUIRED, EVENT.MODULE_PROCESSED],
          eventTime: getLocaleTimeString(),
          modulePath,
        })

        return moduleProxyCache[modulePath]
      } else if (internal) {
        return module

        {
          // TODO: disabled, as unexpected error will throw
          // get cache
          if (moduleProxyCache[modulePath]) return moduleProxyCache[modulePath]

          // make the module's internal reference disable to proxy
          moduleProxyCache[modulePath] = markModuleVisited(module)

          // log require event
          processAndLogEvent({
            eventType: EVENT.MODULE_REQUIRED,
            eventTime: getLocaleTimeString(),
            nativeModulePath: modulePath,
          })
        }

        return moduleProxyCache[modulePath]
      } else {
        return module

        {
          // TODO: disabled, as unexpected error will throw
          // get cache
          if (moduleProxyCache[modulePath]) return moduleProxyCache[modulePath]

          // make the module's internal reference disable to proxy
          moduleProxyCache[modulePath] = markModuleVisited(module)

          // log require event
          processAndLogEvent({
            eventType: EVENT.MODULE_REQUIRED,
            eventTime: getLocaleTimeString(),
            modulePath,
          })
        }

        return moduleProxyCache[modulePath]
      }
    })
  }

const removeLoggers = () => {
  _isLoggerEnabled = false
}

module.exports = {
  config,
  attachLoggers,
  removeLoggers,
}
