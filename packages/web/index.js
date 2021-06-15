const dotenv = require('dotenv-safe')

if (process.env.FEATURE_DOTENV) {
  dotenv.config({
    allowEmptyValues: true
  })
}

require('./app')

export { default as utils } from './util'
