const { config, attachLoggers, removeLoggers } = require('../')

config({
  files: ['**/A.js', '**/C.js', '!**/node_modules/**'],
  logger: (event) => {
    console.log(event)
  },
  tagger: tags => tags['some'] = Math.random()
})

attachLoggers()

const exec = require('exec')

const all = require('./all')

const CC = require('./C')

new all.C().c_method('args: c')

all.A._isArray('_isArray')

all.A.HAHA('HA HA')