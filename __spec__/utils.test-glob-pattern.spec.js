const { testGlobPattern } = require('./../utils.test-glob-pattern')

const expect = require('expect')

describe('utils.test-glob-pattern', () => {
  it('should able to test file glob patterns', async () => {
    expect(
      testGlobPattern(
        ['**/src/**', '!**/node_modules/**'],
        'HK01/repos/payment-service-backend/.git-worktree/origin/feature@WAL-5562-auto-logger-framework/node_modules/sequelize/node_modules/debug/src/common.js'
      )
    ).toBe(false)

    expect(
      testGlobPattern(
        ['**/__test__/**'],
        'src/libs/AutoLogger/utils.test-glob-pattern.spec.js'
      )
    ).toBe(false)

    expect(
      testGlobPattern(
        ['**/*/AutoLogger/__mock__/**'],
        'HK01/repos/payment-service-backend/.git-worktree/origin/feature@WAL-5562-logger-framework/src/libs/AutoLogger/__mock__/auto-logger-mocks.js'
      )
    ).toBe(true)

    expect(
      testGlobPattern(
        ['!**/node_modules/**'],
        'HK01/repos/payment-service-backend/.git-worktree/origin/feature@WAL-5562-auto-logger-framework/node_modules/ramda/src/index.js'
      )
    ).toBe(false)

    expect(
      testGlobPattern(
        ['!**/node_modules/**'],
        'src/libs/AutoLogger/utils.test-glob-pattern.spec.js'
      )
    ).toBe(false)

    expect(
      testGlobPattern(
        ['**/__test__/**', '!**/node_modules/**', '**/*/AutoLogger/__mock__/**'],
        'HK01/repos/payment-service-backend/.git-worktree/origin/feature@WAL-5562-auto-logger-framework/node_modules/ramda/src/index.js'
      )
    ).toBe(false)
  })
})
