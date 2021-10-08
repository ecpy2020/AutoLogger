const { chainCallbacks } = require('./../utils.chain-callbacks')

const expect = require('expect')

describe('utils.chain-callbacks', () => {
  const callOrders = []

  const func_0 = () => callOrders.push(0)
  const func_1 = () => callOrders.push(1)
  const func_2 = () => callOrders.push(2)

  it('should able to chain and call callbacks in correct orders', async () => {
    const chainedFunc = chainCallbacks(
      cb => {
        func_0()
        cb()
      },
      cb => {
        func_1()
        cb()
      },
      cb => {
        func_2()
      }
    )

    chainedFunc()

    expect(callOrders).toEqual([0, 1, 2])
  })
})
