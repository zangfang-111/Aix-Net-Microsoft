import quoteRequestCreated from './quote-request/quote-request-created'
import quoteRequestExpired from './quote-request/quote-request-expired'
import quoteRequestCanceled from './quote-request/quote-request-canceled'
import quoteImprovedUpdate from './quote/quote-improved-update'
import quoteDegradedUpdate from './quote/quote-degraded-update'

export default {
  'quote.request.created' ({ initiatingTraderId, createdQuoteRequestEvent }) {
    quoteRequestCreated(initiatingTraderId, createdQuoteRequestEvent, this.broker)
  },
  'quote.request.expired' ({ quoteRequest }) {
    quoteRequestExpired(quoteRequest, this.broker)
  },
  'quote.request.canceled' (quoteRequest) {
    quoteRequestCanceled(quoteRequest, this.broker)
  },
  'quote.update.improved' ({ quote }) {
    quoteImprovedUpdate(quote, this.broker)
  },
  'quote.update.degraded' ({ quote }) {
    quoteDegradedUpdate(quote, this.broker)
  }
}
