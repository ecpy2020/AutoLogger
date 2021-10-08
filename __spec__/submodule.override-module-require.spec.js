const submodule = require('./../submodule.override-module-require')

const expect = require('expect')

describe('submodule.override-module-require::parseModuleInfos', () => {
  it('should able to parse the module correctly', async () => {
    const module = require('module')

    const { parseModuleInfos } = submodule

    expect(parseModuleInfos(module, 'module')).toStrictEqual({
      internal: true,
      modulePath: 'module',
    })

    expect(parseModuleInfos(submodule, './../submodule.override-module-require')).toMatchObject({
      internal: false,
    })
  })
})
