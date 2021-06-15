import sessionExpired from './session-expired'
import orderExecuted from './order/order-executed'
import quoteRequestExpiring from './quote-request/quote-request-expiring'
import quoteRequestExpired from './quote-request/quote-request-expired'
import quoteImprovedUpdate from './quote-request/quote-improved-update'
import quoteDegradedUpdate from './quote-request/quote-degraded-update'

export default {
  'session.expired': sessionExpired,
  'order.executed' (orders) { orderExecuted(orders, this.broker) },
  'quote.request.expiring': quoteRequestExpiring,
  'quote.request.expired': quoteRequestExpired,
  'quote.update.improved' ({ traderId, quote }) { quoteImprovedUpdate(traderId, quote, this.broker) },
  'quote.update.degraded' ({ traderId, quote }) { quoteDegradedUpdate(traderId, quote, this.broker) }
}
