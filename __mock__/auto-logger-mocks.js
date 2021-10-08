let mockError

mockError = new Error()

const mockReturn = 'testing'

class TestParentClass {
  async testAsyncMethod(params) {
    return Promise.resolve(mockReturn)
  }

  async testAsyncMethodWithError(params) {
    return Promise.reject(mockError)
  }

  testMethod(params) {
    return mockReturn
  }

  throwError(params) {
    throw mockError
  }
}

class TestChildClass extends TestParentClass {}

function testFunctionCall(...args) {
  return mockReturn
}

function testFunctionError() {
  throw mockError
}

module.exports = {
  TestChildClass,
  mockError,
  mockReturn,
  testFunctionError,
  testFunctionCall,
  testAnonymousFunctionReturningPromise: function (payload) {
    return new Promise(resolve => {
      resolve(payload)
    })
  },
}
