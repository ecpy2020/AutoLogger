const DEBUG = false

const log = msg => console.log(msg)

module.exports = {
  DEBUG,
  debugLog: (funcName, msg, payload) => {
    if (!DEBUG) return
    log(`debug: ${funcName} => ${msg}`)
    log(payload)
    log([...new Array(100).keys()].map(() => '-').join(''))
  },
}
