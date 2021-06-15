import { QUOTE_REQUEST_STATUSES } from '../../constants'

async function quoteRequestExpired (expiredQuoteRequestEvent, broker) {
  const quoteRequest = await broker.call('db.quoteRequest.findOne', {
    quoteRequestId: expiredQuoteRequestEvent.quoteRequestId
  })
  await broker.call('db.quoteRequest.update', {
    id: quoteRequest.id,
    expiredQuoteRequestEvent: expiredQuoteRequestEvent,
    status: QUOTE_REQUEST_STATUSES.EXPIRED
  })
}

export default quoteRequestExpired
