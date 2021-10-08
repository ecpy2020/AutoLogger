const { config, attachLoggers, removeLoggers } = require('./../index.js')

const jest = require('jest-mock')

const { EVENT } = require('./../submodule.module-proxy-builder')

const expect = require('expect')

describe('auto-logger-framework', () => {
  // config file patterns
  config({
    files: ['**/__mock__/**'],
  })

  let callback = event => {}

  // config logger
  config({
    logger: event => {
      callback(event)
    },
  })

  let mocks

  beforeEach(() => {
    attachLoggers()
  })

  afterEach(() => {
    removeLoggers()
  })

  it('can log event of [required module]', done => {
    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: [EVENT.MODULE_REQUIRED, EVENT.MODULE_PROCESSED],
      })
      expect(event).toHaveProperty('eventTime')
      expect(event).toHaveProperty('modulePath')

      // exit
      done()
    }

    mocks = require('../__mock__/auto-logger-mocks.js')
  })

  let classInstance

  it('can log event of [creating instance from class]', done => {
    const { TestChildClass } = mocks

    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_START,
        className: TestChildClass.name,
        functionName: 'constructor',
        functionArguments: JSON.stringify([]),
      })

      expect(event).toHaveProperty('eventTime')

      expect(event).toHaveProperty('classInstanceId')

      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_RETURN,
          className: TestChildClass.name,
          functionName: 'constructor',
        })

        expect(event).toHaveProperty('functionReturn')

        expect(event).toHaveProperty('functionExecutionTime')

        // exit
        done()
      }
    }

    // create instance from class
    classInstance = new TestChildClass()
  })

  it("can log event of [calling class instance's async method]", () =>
    new Promise(async resolve => {
      const { TestChildClass } = mocks

      // test callbacks
      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
          className: TestChildClass.name,
          functionName: classInstance.testAsyncMethod.name,
          functionArguments: JSON.stringify([]),
        })

        expect(event).toHaveProperty('eventTime')

        expect(event).toHaveProperty('classInstanceId')

        callback = event => {
          expect(event).toMatchObject({
            eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ASYNC_RETURN,
            className: TestChildClass.name,
            functionName: classInstance.testAsyncMethod.name,
          })

          expect(event).toHaveProperty('functionReturn')

          expect(event).toHaveProperty('functionExecutionTime')

          // exit
          resolve()
        }
      }

      await expect(classInstance.testAsyncMethod()).resolves.toBe(mockReturn)
    }))

  it("can log event of [calling class instance's async method with error]", () =>
    new Promise(async resolve => {
      const { TestChildClass, mockError } = mocks

      // test callbacks
      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
          className: TestChildClass.name,
          functionName: classInstance.testAsyncMethodWithError.name,
          functionArguments: JSON.stringify([]),
        })

        expect(event).toHaveProperty('eventTime')

        expect(event).toHaveProperty('classInstanceId')

        callback = event => {
          expect(event).toMatchObject({
            eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ERROR,
            className: TestChildClass.name,
            functionError: mockError,
            functionName: classInstance.testAsyncMethodWithError.name,
          })

          expect(event).toHaveProperty('functionExecutionTime')

          // exit
          resolve()
        }
      }

      await expect(classInstance.testAsyncMethodWithError()).rejects.toBe(mockError)
    }))

  it("can log event of [calling class instance's normal method]", done => {
    const { TestChildClass, mockError, mockReturn } = mocks

    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
        className: TestChildClass.name,
        functionName: classInstance.testMethod.name,
        functionArguments: JSON.stringify([]),
      })

      expect(event).toHaveProperty('eventTime')

      expect(event).toHaveProperty('classInstanceId')

      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_SYNC_RETURN,
          className: TestChildClass.name,
          functionName: classInstance.testMethod.name,
        })

        expect(event).toHaveProperty('functionReturn')

        expect(event).toHaveProperty('functionExecutionTime')

        // exit
        done()
      }
    }

    expect(classInstance.testMethod()).toBe(mockReturn)
  })

  it('can log event of [class instance is throwing error]', done => {
    const { TestChildClass, mockError } = mocks
    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
        className: TestChildClass.name,
        functionName: classInstance.throwError.name,
        functionArguments: JSON.stringify([]),
      })

      expect(event).toHaveProperty('eventTime')

      expect(event).toHaveProperty('classInstanceId')

      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ERROR,
          className: TestChildClass.name,
          functionError: mockError,
          functionName: classInstance.throwError.name,
        })

        expect(event).toHaveProperty('functionExecutionTime')

        // exit
        done()
      }
    }

    expect(() => classInstance.throwError()).toThrow(mockError)
  })

  it('can log event of [common function calls]', done => {
    const { testFunctionCall, mockReturn } = mocks

    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: EVENT.RAW_FUNCTION_CALL_START,
        functionName: testFunctionCall.name,
        functionArguments: JSON.stringify([]),
      })

      expect(event).toHaveProperty('eventTime')

      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.RAW_FUNCTION_CALL_SYNC_RETURN,
          functionName: testFunctionCall.name,
        })

        expect(event).toHaveProperty('functionReturn')

        expect(event).toHaveProperty('functionExecutionTime')

        // exit
        done()
      }
    }

    expect(testFunctionCall()).toBe(mockReturn)
  })

  it('can log event of [common function throwing error]', done => {
    const { testFunctionError, mockError } = mocks
    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: EVENT.RAW_FUNCTION_CALL_START,
        functionName: testFunctionError.name,
        functionArguments: JSON.stringify([]),
      })

      expect(event).toHaveProperty('eventTime')

      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.RAW_FUNCTION_CALL_ERROR,
          functionError: mockError,
          functionName: testFunctionError.name,
        })

        expect(event).toHaveProperty('functionExecutionTime')

        // exit
        done()
      }
    }

    expect(() => testFunctionError()).toThrow(mockError)
  })

  it('can log events [with custom tags]', done => {
    const customTag = 'customTag'

    config({
      tagger: obj => (obj[customTag] = customTag),
    })

    const { testFunctionCall, mockReturn } = mocks

    // test callbacks
    callback = event => {
      expect(event).toMatchObject({
        eventType: EVENT.RAW_FUNCTION_CALL_START,
        functionName: testFunctionCall.name,
        functionArguments: JSON.stringify([]),
      })

      expect(event.tags).toMatchObject({
        customTag,
      })

      expect(event).toHaveProperty('eventTime')

      callback = event => {
        expect(event).toMatchObject({
          eventType: EVENT.RAW_FUNCTION_CALL_SYNC_RETURN,
          functionName: testFunctionCall.name,
        })

        expect(event.tags).toMatchObject({
          customTag,
        })

        expect(event).toHaveProperty('functionReturn')

        expect(event).toHaveProperty('functionExecutionTime')

        // exit
        done()
      }
    }

    expect(testFunctionCall()).toBe(mockReturn)
  })

  it('can not log any events [after the auto logger is detached]', async () => {
    // config file patterns
    config({
      files: ['**/__mock__/**'],
    })

    const callback = jest.fn()

    // config logger
    config({
      logger: event => {
        callback(event)
      },
    })

    // detach the logger
    removeLoggers()

    // normal require
    const {
      TestChildClass,
      mockError,
      mockReturn,
      testFunctionError,
      testFunctionCall,
    } = require('../__mock__/auto-logger-mocks.js')

    // create instance from class
    const classInstance = new TestChildClass()

    await expect(classInstance.testAsyncMethod()).resolves.toBe(mockReturn)

    await expect(classInstance.testAsyncMethodWithError()).rejects.toBe(mockError)

    expect(classInstance.testMethod()).toBe(mockReturn)

    expect(() => classInstance.throwError()).toThrow(mockError)

    expect(testFunctionCall()).toBe(mockReturn)

    expect(() => testFunctionError()).toThrow(mockError)

    expect(callback.mock.calls).toEqual([])
  })
})
