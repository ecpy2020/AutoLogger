function isClass(obj) {
  const isCtorClass =
    obj.constructor && obj.constructor.toString().substring(0, 5) === 'class'
  if (obj.prototype === undefined) {
    return isCtorClass
  }
  const isPrototypeCtorClass =
    obj.prototype.constructor &&
    obj.prototype.constructor.toString &&
    obj.prototype.constructor.toString().substring(0, 5) === 'class'
  return isCtorClass || isPrototypeCtorClass
}

function isFunction(funcOrClass) {
  const propertyNames = Object.getOwnPropertyNames(funcOrClass)

  return (
    !propertyNames.includes('prototype') ||
    propertyNames.includes('arguments') ||
    funcOrClass.toString().substring(0, 8) === 'function'
  )
}

module.exports = {
  isClass,
  isFunction,
}
