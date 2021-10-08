function getInternalKeys(toCheck) {
  var props = [];
  var obj = toCheck;
  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while (
    (obj = Object.getPrototypeOf(obj))
  );

  return props.sort().filter(function (e, i, arr) {
    try {
      if (e != arr[i + 1] && typeof toCheck[e] == "function") {
        return true;
      }
    } catch (err) {
      return false;
    }
  });
}

function getClassFunctionKeys(toCheck) {
  var props = []
  var obj = toCheck
  do {
    props = props.concat(Object.getOwnPropertyNames(obj))
  } while (
    (obj = Object.getPrototypeOf(obj)) &&
    obj !== Object.prototype &&
    obj !== Function.prototype
  )

  function isFunctionConstructor(func) {
    return func.toString().substring(0, 6) === 'class '
  }

  return props.sort().filter(function (e, i, arr) {
    try {
      if (e !== arr[i + 1] && typeof toCheck[e] === 'function') {
        return true
      }
    } catch (err) {
      return false
    }
  })
}

module.exports = {
  getClassFunctionKeys,
  getInternalKeys,
}
