import mongoose from '../mongoose'
import fixturesLoader from './fixtures-loader'
const dotenv = require('dotenv-safe')

if (process.env.FEATURE_DOTENV) {
  dotenv.config({
    allowEmptyValues: false
  })
}

mongoose.connect(process.env.MONGODB_URI, {}, err => {
  if (err) {
    throw err
  }
  fixturesLoader.loadFixtures(false, () => {
    mongoose.connection.close()
  })
})
