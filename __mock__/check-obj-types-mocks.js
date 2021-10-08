'use strict'

const exportedLaterAttachedArrowFunction = (a, b) => {}

module.exports = {
  someExportedClass: class {},
  someExportedFunction: function () {},
  exportedLaterAttachedArrowFunction,
}

module.exports.exportedLaterAttachedAnonymousFunction = function (a, b) {
  return new Promise(resolve => {
    resolve()
  })
}
