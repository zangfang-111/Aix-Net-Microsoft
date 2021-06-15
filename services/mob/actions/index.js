import { addOrder } from './add-order'
import add2WayOrder from './add-2way-order'
import add2WayQuote from './add-2way-quote'
import add1WayQuote from './add-1way-quote'
import {
  getOpenOrdersByTelegramId,
  getExecutedOrdersByTelegramId,
  getCurrentDayExecutedOrders
} from './find-order-by-trader-id'
import { getAllOrdersByTelegramId } from './find-all-orders'
import { startStreamService } from './stream-service'
import { updateOrder } from './update-order'
import {
  cancelAllOrders
} from './cancel-orders'
import findLatestOpenQuotes from './find-latest-open-quotes'
import cancelOrder from './cancel-order'

export default {
  'order.add': addOrder,
  'order.update': updateOrder,
  'order.add2Way': add2WayOrder,
  'order.findOrders': getAllOrdersByTelegramId,
  'order.findOpenOrders': getOpenOrdersByTelegramId,
  'order.findExecutedOrders': getExecutedOrdersByTelegramId,
  'order.findCurrentDayExecutedOrders': getCurrentDayExecutedOrders,
  'order.cancel.one': cancelOrder,
  'order.cancel.all': cancelAllOrders,
  'startStreamService': startStreamService,
  'quote.findLatestOpenQuotes': findLatestOpenQuotes,
  'quote.add2Way': add2WayQuote,
  'quote.add': add1WayQuote
}
