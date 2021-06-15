import async from 'async'
import mongoose from 'mongoose'
import Trader from '../actions/trader/model'
import FinancialInstrument from '../actions/financial-instrument/model'
import User from '../actions/user/model'
import developmentData from './development'
import testData from './test'

const debug = require('debug')('AiX:fixtures-loader')

/**
 * Fixtures data are loaded from src/fixtures/development or src/fixtures/test
 * directories. If you didn't set any fixtures data, please create the default
 * fixtures data files by copying each [.sample.js] file found in the data
 * directory, into individual [.js] files. (Yes, you only have to create a
 * new file with .sample removed). Any fixtures date provided in the non .sample
 * files will be local (ignored by git).
 * Advantage: Your trader accounts won't mess up with other developer's trader
 * accounts.
 */

function loadFixtures (runSilent, callback) {
  this.runSilent = runSilent

  !this.runSilent && debug('Loading fixtures...\n')

  let fixtureLoaderCommands = null

  if (process.env.NODE_ENV === 'unit_test') {
    // use the fixture data from /test
    fixtureLoaderCommands = [
      dropEntireDatabase.bind(this),
      financialInstrumentsLoader.bind(this, testData.financialInstruments),
      traderLoader.bind(this, testData.traders),
      interDocumentMapsLoader.bind(this, testData.maps),
      userLoader.bind(this, testData.users)
    ]
  } else {
    // use the fixtures data from /development
    fixtureLoaderCommands = [
      dropEntireDatabase.bind(this),
      financialInstrumentsLoader
        .bind(this, developmentData.financialInstruments),
      traderLoader.bind(this, developmentData.traders),
      interDocumentMapsLoader.bind(this, developmentData.maps),
      userLoader.bind(this, developmentData.users)
    ]
  }

  // run each load fixture command in order
  async.eachSeries(
    fixtureLoaderCommands,
    function loadFixtureSet (fixturesLoader, callback) {
      fixturesLoader(callback)
    },
    callback
  )
}

function dropEntireDatabase (callback) {
  !this.runSilent && debug('\nRemoving all collections from db:')

  let collections = Object.values(mongoose.connection.collections)

  async.map(
    collections,
    (collection, callback) => collection.remove(callback),
    callback
  )
}

function traderLoader (traders, callback) {
  !this.runSilent && debug('\nLoading traders:')
  async.each(
    traders,
    (trader, callback) => {
      Trader
        .findOne({ telegramId: trader.telegramId }, (err, foundTrader) => {
          debug(err)

          if (!foundTrader) {
            return Trader
              .create(trader)
              .then(() => callback())
              .catch(err => {
                debug(err)
                callback(err)
              })
          }

          foundTrader
            .update(trader, { overwrite: true })
            .then(() => callback())
            .catch(err => {
              debug(err)
              callback(err)
            })
        })
    },
    callback
  )
}

function financialInstrumentsLoader (financialInstruments, callback) {
  !this.runSilent && debug('\nLoading financial instruments:')

  async.each(
    financialInstruments,
    (instrument, callback) => {
      FinancialInstrument
        .findOne({ label: instrument.label }, (err, financialInstrument) => {
          debug(err)

          if (!financialInstrument) {
            return FinancialInstrument
              .create(instrument)
              .then(() => callback())
              .catch(err => {
                debug(err)
                callback(err)
              })
          }

          financialInstrument
            .update(instrument, { overwrite: true })
            .then(() => callback())
            .catch(err => {
              debug(err)
              callback(err)
            })
        })
    },
    callback
  )
}

function interDocumentMapsLoader (mapSets, callback) {
  !this.runSilent && debug('\nCreating inter-document links:')

  async.each(
    Object.keys(mapSets),
    (mapSetFieldName, callback) => {
      let mapSet = mapSets[mapSetFieldName]

      switch (mapSetFieldName) {
        case 'traderFinancialInstrumentsMap':
          return mapFinancialInstrumentsToTraders.bind(this)(mapSet, callback)
        case 'transactionToTransactionsSessionMap':
        default:
          return callback()
      }
    },
    callback
  )
}

function mapFinancialInstrumentsToTraders (maps, callback) {
  !this.runSilent && debug('\nLinking financial instruments to traders:')

  async.each(maps, (map, callback) => {
    Trader.findOne(map.traderMatchCondition, (err, trader) => {
      if (err) {
        return callback(err)
      }
      FinancialInstrument.find(
        map.financialInstrumentMatchCondition,
        (err, instruments) => {
          if (err) {
            return callback(err)
          } else if (!trader) {
            return callback(new Error('Missing trader'))
          }
          trader.update({
            financialInstrumentsInUse: instruments.map(instrument => instrument._id)
          })
            .then(() => callback())
            .catch(err => {
              debug(err)
              callback(err)
            })
        })
    })
  }, err => {
    console.log(err)
    callback()
  })
}

function userLoader (users, callback) {
  !this.runSilent && debug('\nLoading users:')
  async.each(
    users,
    (user, callback) => {
      User
        .findOne({ email: user.email }, (err, foundUser) => {
          debug(err)

          if (!foundUser) {
            return User
              .create(user)
              .then(() => callback())
              .catch(err => {
                debug(err)
                callback(err)
              })
          }

          foundUser
            .update(user, { overwrite: true })
            .then(() => callback())
            .catch(err => {
              debug(err)
              callback(err)
            })
        })
    },
    callback
  )
}

export default {
  loadFixtures
}
