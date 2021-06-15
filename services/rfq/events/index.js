import quoteRequestExpired from './quote-request-expired'
import quoteRequestCanceled from './quote-request-canceled'

export default {
  'quote.request.expired' ({ quoteRequest }) { quoteRequestExpired(quoteRequest, this.broker) },
  'quote.request.canceled' (quoteRequest) { quoteRequestCanceled(quoteRequest, this.broker) }
}
