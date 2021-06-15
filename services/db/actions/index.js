import findByTelegramId from './trader/findByTelegramId'
import listMarketMakers from './trader/listMarketMakers'
import bugActions from './bug/actions'
import quoteRequestActions from './quote-request/actions'
import chatActions from './chat/actions'
import financialInstrumentActions from './financial-instrument/actions'
import orderActions from './order/actions'
import findByTraderId from './trader/findById'
import findMarketMakers from './trader/findMarketMakers'
import findAllTraders from './trader/findAll'
import userActions from './user/action'
import rfqActions from './rfq/actions'
import adminActions from './dashboard-admin/actions'
import traderActions from './trader/actions'

export default {
  'trader.show': findByTelegramId,
  'trader.get': findByTraderId,
  'trader.findAll': findAllTraders,
  'trader.getMarketMakers': findMarketMakers,
  // trader/actions.js
  'trader.create': traderActions.create,
  'trader.find': traderActions.findAll,
  'trader.findById': traderActions.findByTraderId,
  'trader.findByTelegramId': traderActions.findByTelegramId,
  'trader.update': traderActions.update,
  'trader.delete': traderActions.delete,
  'listMarketMakers': listMarketMakers,
  'bug.create': bugActions.create,
  'quoteRequest.create': quoteRequestActions.create,
  'quoteRequest.find': quoteRequestActions.find,
  'quoteRequest.findOne': quoteRequestActions.findOne,
  'quoteRequest.findById': quoteRequestActions.findById,
  'quoteRequest.count': quoteRequestActions.count,
  'quoteRequest.update': quoteRequestActions.update,
  'quoteRequest.delete': quoteRequestActions.delete,
  'chat.create': chatActions.create,
  'chat.get': chatActions.getChatMessage,
  'financialInstrument.get': financialInstrumentActions.get,
  'user.get': userActions.getUserByEmail,
  'admin.getByEmail': adminActions.getAdminByEmail,
  'admin.create': adminActions.create,
  'order.create': orderActions.create,
  'order.find': orderActions.find,
  'order.findOne': orderActions.findOne,
  'order.count': orderActions.count,
  'order.update': orderActions.update,
  'order.executed': orderActions.executed,
  // RFQ
  'rfq.create': rfqActions.create,
  'rfq.find': rfqActions.find,
  'rfq.findWithLimit': rfqActions.findWithLimit,
  'rfq.findActive': rfqActions.findActive,
  'rfq.count': rfqActions.count,
  'rfq.findAndUpdate': rfqActions.findAndUpdate,
  'rfq.findOne': rfqActions.findOne,
  // Financial Instrument
  'financialInstrument.find': financialInstrumentActions.findAll
}
