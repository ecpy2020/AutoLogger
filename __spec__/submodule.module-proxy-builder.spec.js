const { EVENT, buildModuleProxy } = require('./../submodule.module-proxy-builder')

const { chainCallbacks } = require('./../utils.chain-callbacks')

const expect = require('expect')

// REMARK:
// - jest will override default require call, which is also originally overridden by the logger library,
//   so mocha will be used instead

describe('submodule.module-proxy-builder::buildModuleProxy', () => {
  let module

  const mocks = {
    parentClassSomeClassMethodCallArguments: [
      'parentClassSomeClassMethodCallArguments_0',
      'parentClassSomeClassMethodCallArguments_1',
    ],
    childClassConstructorCallArguments: [
      'childClassConstructorCallArguments_0',
      'childClassConstructorCallArguments_1',
    ],
    childClassSomeClassMethodCallArguments: [
      'childClassSomeClassMethodCallArguments_0',
      'childClassSomeClassMethodCallArguments_1',
    ],
    childClassSomeClassMethodReturn: 'childClassSomeClassMethodReturn',
    childClassSomeAsyncClassMethodReturn: 'childClassSomeAsyncClassMethodReturn',
    childClassSomeStaticClassMethodReturn: 'childClassSomeStaticClassMethodReturn',
    parentClassSomeStaticClassMethodReturn: 'parentClassSomeStaticClassMethodReturn',
    moduleSomeMethodArguments: ['moduleSomeMethodArguments'],
    moduleSomeMethodReturn: ['moduleSomeMethodReturn'],
    moduleSomeAsyncMethodArguments: ['moduleSomeAsyncMethodArguments'],
    moduleSomeAsyncMethodReturn: ['moduleSomeAsyncMethodReturn'],
    moduleSomeAsyncMethodError: new Error(),
    moduleSomeMethodThrownError: new Error(),
    parentClassSomeMethodThrownError: new Error(),
  }

  beforeEach(() => {
    function createModule() {
      class ParentClass {
        someClassMethodThrowingError() {
          throw mocks.parentClassSomeMethodThrownError
        }

        async someClassAsyncMethodThrowingError() {
          throw mocks.parentClassSomeMethodThrownError
        }
      }

      ParentClass.someParentClassStaticMethod = function () {
        return mocks.parentClassSomeStaticClassMethodReturn
      }

      class ChildClass extends ParentClass {
        someClassMethod(args) {
          return mocks.childClassSomeClassMethodReturn
        }

        async someClassAsyncMethod(args) {
          return Promise.resolve(mocks.childClassSomeAsyncClassMethodReturn)
        }
      }

      ChildClass.someChildClassStaticMethod = function () {
        return mocks.childClassSomeStaticClassMethodReturn
      }

      const module = {
        // eslint-disable-next-line
        async someModuleAsyncMethodThrowingError() {
          // eslint-disable-next-line
          throw mocks.moduleSomeAsyncMethodError
        },

        async someModuleAsyncMethod() {
          return Promise.resolve(mocks.moduleSomeAsyncMethodReturn)
        },

        someModuleMethodThrowingError() {
          throw mocks.moduleSomeMethodThrownError
        },

        someModuleMethod() {
          return mocks.moduleSomeMethodReturn
        },

        someClass: ChildClass,
      }

      module.someLaterAttachedModuleMethodReturnPromise = function (payload) {
        return new Promise(resolve => {
          resolve(payload)
        })
      }

      return module
    }

    module = createModule()
  })

  context("when proxy the module's native functions", async () => {
    let callback

    let modulePath = 'modulePath'

    it('shd log #someModuleMethod call events', done => {
      module = buildModuleProxy(module, modulePath, event => {
        try {
          callback(event)
        } catch (err) {
          console.log(err)
        }
      })

      chainCallbacks(
        cb => {
          callback = event => {
            expect(event).toMatchObject({
              eventType: EVENT.RAW_FUNCTION_CALL_START,
              functionName: module.someModuleMethod.name,
              functionArguments: mocks.moduleSomeMethodArguments,
              modulePath,
            })

            cb()
          }
        },
        cb => {
          callback = event => {
            expect(event).toMatchObject({
              eventType: EVENT.RAW_FUNCTION_CALL_SYNC_RETURN,
              functionName: module.someModuleMethod.name,
              functionReturn: mocks.moduleSomeMethodReturn,
              modulePath,
            })
            expect(event).toHaveProperty('functionExecutionTime')
            done()
          }
        }
      )()

      // call native function
      expect(module.someModuleMethod(...mocks.moduleSomeMethodArguments)).toEqual(
        mocks.moduleSomeMethodReturn
      )
    })

    it('shd log #someModuleAsyncMethod events', async () =>
      new Promise(async (resolve, _) => {
        module = buildModuleProxy(module, modulePath, event => {
          try {
            callback(event)
          } catch (err) {
            console.log(err)
          }
        })

        // listen proxy callbacks
        chainCallbacks(
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.RAW_FUNCTION_CALL_START,
                functionName: module.someModuleAsyncMethod.name,
                functionArguments: mocks.moduleSomeAsyncMethodArguments,
                modulePath,
              })

              cb()
            }
          },
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.RAW_FUNCTION_CALL_ASYNC_RETURN,
                functionName: module.someModuleAsyncMethod.name,
                functionReturn: mocks.moduleSomeAsyncMethodReturn,
                modulePath,
              })
              expect(event).toHaveProperty('functionExecutionTime')
              resolve()
            }
          }
        )()

        // call native async function
        await expect(
          module.someModuleAsyncMethod(...mocks.moduleSomeAsyncMethodArguments)
        ).resolves.toEqual(mocks.moduleSomeAsyncMethodReturn)
      }))

    it("shd log method @someLaterAttachedModuleMethodReturnPromise's call events", done => {
      module = buildModuleProxy(module, modulePath, event => {
        try {
          callback(event)
        } catch (err) {
          console.log(err)
        }
      })

      chainCallbacks(
        cb => {
          callback = event => {
            expect(event).toMatchObject({
              eventType: EVENT.RAW_FUNCTION_CALL_START,
              functionName: '',
              functionKey: 'someLaterAttachedModuleMethodReturnPromise',
              functionArguments: mocks.moduleSomeMethodArguments,
              modulePath,
            })

            cb()
          }
        },
        cb => {
          callback = event => {
            expect(event).toMatchObject({
              eventType: EVENT.RAW_FUNCTION_CALL_ASYNC_RETURN,
              functionName: '',
              functionKey: 'someLaterAttachedModuleMethodReturnPromise',
              modulePath,
            })

            expect(event).toMatchObject({
              eventType: EVENT.RAW_FUNCTION_CALL_ASYNC_RETURN,
              functionName: '',
              functionKey: 'someLaterAttachedModuleMethodReturnPromise',
              modulePath,
            })
            expect(event).toHaveProperty('functionExecutionTime')
            expect(event).toHaveProperty('functionReturn')
            expect(event.functionReturn).toBe(...mocks.moduleSomeMethodArguments)

            done()
          }
        }
      )()

      expect(
        module.someLaterAttachedModuleMethodReturnPromise(
          ...mocks.moduleSomeMethodArguments
        ) instanceof Promise
      ).toBe(true)
    })
  })

  context(
    "when proxy the module's child and parent class's static and instance functions",
    async () => {
      let callback

      let modulePath = 'modulePath'

      it("log someClass.someChildClassStaticMethod's call events", async done => {
        module = buildModuleProxy(module, modulePath, event => {
          try {
            callback(event)
          } catch (err) {
            console.log(err)
          }
        })

        chainCallbacks(
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_STATIC_FUNCTION_CALL_START,
                className: module.someClass.name,
                functionName: module.someClass.someChildClassStaticMethod.name,
                functionArguments: mocks.childClassSomeClassMethodCallArguments,
                modulePath,
              })
              cb()
            }
          },
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_STATIC_FUNCTION_CALL_SYNC_RETURN,
                className: module.someClass.name,
                functionName: module.someClass.someChildClassStaticMethod.name,
                functionReturn: mocks.childClassSomeStaticClassMethodReturn,
                modulePath,
              })
              expect(event).toHaveProperty('functionExecutionTime')
              done()
            }
          }
        )()
        // call child class static function
        expect(
          module.someClass.someChildClassStaticMethod(
            ...mocks.childClassSomeClassMethodCallArguments
          )
        ).toEqual(mocks.childClassSomeStaticClassMethodReturn)
      })

      it("shd log someClass.someParentClassStaticMethod's call events", done => {
        module = buildModuleProxy(module, modulePath, event => {
          try {
            callback(event)
          } catch (err) {
            console.log(err)
          }
        })
        chainCallbacks(
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_STATIC_FUNCTION_CALL_START,
                className: module.someClass.name,
                functionName: module.someClass.someParentClassStaticMethod.name,
                functionArguments: mocks.parentClassSomeClassMethodCallArguments,
                modulePath,
              })
              cb()
            }
          },
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_STATIC_FUNCTION_CALL_SYNC_RETURN,
                className: module.someClass.name,
                functionName: module.someClass.someParentClassStaticMethod.name,
                functionReturn: mocks.parentClassSomeStaticClassMethodReturn,
                modulePath,
              })
              expect(event).toHaveProperty('functionExecutionTime')
              done()
            }
          }
        )()
        // call parent class static function
        expect(
          module.someClass.someParentClassStaticMethod(
            ...mocks.parentClassSomeClassMethodCallArguments
          )
        ).toEqual(mocks.parentClassSomeStaticClassMethodReturn)
      })

      let instance

      it("shd log new someClass(...)'s events", async done => {
        module = buildModuleProxy(module, modulePath, event => {
          try {
            callback(event)
          } catch (err) {
            console.log(err)
          }
        })

        chainCallbacks(
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_START,
                className: module.someClass.name,
                functionName: 'constructor',
                functionArguments: mocks.childClassSomeClassMethodCallArguments,
                modulePath,
              })

              cb()
            }
          },
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_CONSTRUCTOR_FUNCTION_CALL_RETURN,
                className: module.someClass.name,
                functionName: 'constructor',
                modulePath,
              })

              expect(event).toHaveProperty('functionReturn')

              expect(event).toHaveProperty('functionExecutionTime')
              done()
            }
          }
        )()
        // new child class
        instance = new module.someClass(...mocks.childClassSomeClassMethodCallArguments)

        expect(instance).toHaveProperty(
          'someClassMethod',
          'someClassAsyncMethod',
          'someClassMethodThrowingError',
          'someClassAsyncMethodThrowingError',
          'someChildClassStaticMethod',
          'someParentClassStaticMethod'
        )
      })

      it("shd log instance#someClassMethod's call events", done => {
        chainCallbacks(
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
                className: module.someClass.name,
                functionName: instance.someClassMethod.name,
                functionArguments: mocks.childClassSomeClassMethodCallArguments,
                modulePath,
              })

              cb()
            }
          },
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_SYNC_RETURN,
                className: module.someClass.name,
                functionName: instance.someClassMethod.name,
                functionReturn: mocks.childClassSomeClassMethodReturn,
                modulePath,
              })

              expect(event).toHaveProperty('functionExecutionTime')
              done()
            }
          }
        )()

        expect(
          instance.someClassMethod(...mocks.childClassSomeClassMethodCallArguments)
        ).toBe(mocks.childClassSomeClassMethodReturn)
      })

      it("shd log instance#someClassAsyncMethod's call events", async () =>
        new Promise(async (resolve, _) => {
          chainCallbacks(
            cb => {
              callback = event => {
                expect(event).toMatchObject({
                  eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
                  className: module.someClass.name,
                  functionName: instance.someClassAsyncMethod.name,
                  functionArguments: mocks.childClassSomeClassMethodCallArguments,
                  modulePath,
                })

                cb()
              }
            },
            cb => {
              callback = event => {
                expect(event).toMatchObject({
                  eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ASYNC_RETURN,
                  className: module.someClass.name,
                  functionName: instance.someClassAsyncMethod.name,
                  functionReturn: mocks.childClassSomeAsyncClassMethodReturn,
                  modulePath,
                })

                expect(event).toHaveProperty('functionExecutionTime')
                resolve()
              }
            }
          )()

          await expect(
            instance.someClassAsyncMethod(...mocks.childClassSomeClassMethodCallArguments)
          ).resolves.toBe(mocks.childClassSomeAsyncClassMethodReturn)
        }))

      it('shd log instance#someClassAsyncMethodThrowingError throwing error', async () =>
        new Promise(async (resolve, _) => {
          chainCallbacks(
            cb => {
              callback = event => {
                expect(event).toMatchObject({
                  eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
                  className: module.someClass.name,
                  functionName: instance.someClassAsyncMethodThrowingError.name,
                  functionArguments: mocks.childClassSomeClassMethodCallArguments,
                  modulePath,
                })

                cb()
              }
            },
            cb => {
              callback = event => {
                expect(event).toMatchObject({
                  eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ERROR,
                  className: module.someClass.name,
                  functionName: instance.someClassAsyncMethodThrowingError.name,
                  functionError: mocks.parentClassSomeMethodThrownError,
                  modulePath,
                })

                expect(event).toHaveProperty('functionExecutionTime')
                resolve()
              }
            }
          )()

          await expect(
            instance.someClassAsyncMethodThrowingError(
              ...mocks.childClassSomeClassMethodCallArguments
            )
          ).rejects.toBe(mocks.parentClassSomeMethodThrownError)
        }))

      it('shd log instance#someClassMethodThrowingError throwing error', async done => {
        /**
         * test class instance's method throwing error
         */

        // listen proxy callbacks
        chainCallbacks(
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_START,
                className: module.someClass.name,
                functionName: instance.someClassMethodThrowingError.name,
                functionArguments: mocks.childClassSomeClassMethodCallArguments,
                modulePath,
              })

              cb()
            }
          },
          cb => {
            callback = event => {
              expect(event).toMatchObject({
                eventType: EVENT.CLASS_INSTANCE_FUNCTION_CALL_ERROR,
                className: module.someClass.name,
                functionName: instance.someClassMethodThrowingError.name,
                functionError: mocks.parentClassSomeMethodThrownError,
                modulePath,
              })

              expect(event).toHaveProperty('functionExecutionTime')
              done()
            }
          }
        )()

        expect(() => {
          instance.someClassMethodThrowingError(
            ...mocks.childClassSomeClassMethodCallArguments
          )
        }).toThrow(mocks.parentClassSomeMethodThrownError)
      })
    }
  )
})
