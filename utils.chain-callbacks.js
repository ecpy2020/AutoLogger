/**
 *
 * @param  {Array<function>} callbacks - callback: (next) => {}
 */
function chainCallbacks(...callbacks) {
  let next = () => {}
  for (const cb of callbacks.reverse()) {
    const _next = next
    next = () => {
      cb(_next)
    }
  }
  return next
}

module.exports = {
  chainCallbacks,
}
