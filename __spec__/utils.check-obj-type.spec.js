const { isClass, isFunction } = require('./../utils.check-obj-type')

const {
  exportedLaterAttachedAnonymousFunction,
  someExportedClass,
  someExportedFunction,
  exportedLaterAttachedArrowFunction,
} = require('./../__mock__/check-obj-types-mocks')

const expect = require('expect')

describe('utils.check-obj-type', () => {
  it('should check valid obj type', () => {
    expect(isFunction(someExportedFunction)).toBe(true)

    expect(isClass(someExportedClass)).toBe(true)

    expect(isFunction(exportedLaterAttachedAnonymousFunction)).toBe(true)

    expect(isFunction(exportedLaterAttachedArrowFunction)).toBe(true)
  })
})
