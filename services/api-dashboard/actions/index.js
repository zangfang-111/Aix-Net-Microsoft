import admin from './admin.js'
import auth from './auth.js'
import trader from './trader'

import financialInstrument from './financial-instrument'

import quoteRequest from './quote-request'

export default {
  'admin.get': admin.get,
  'admin.create': admin.create,
  'auth.login': auth.login,
  'trader.create': trader.create,
  'trader.get': trader.get,
  'trader.getById': trader.getById,
  'trader.getByTelegramId': trader.getByTelegramId,
  'trader.update': trader.update,
  'trader.delete': trader.delete,

  'financial-instrument.get': financialInstrument.get,

  'quoteRequest.get': quoteRequest.get,
  'quoteRequest.getById': quoteRequest.getById,
  'quoteRequest.delete': quoteRequest.delete

}
