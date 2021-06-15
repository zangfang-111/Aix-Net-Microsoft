import { QUOTE_REQUEST_STATUSES } from '../../constants'

async function quoteRequestCanceled (canceledQuoteRequestEvent, broker) {
  const quoteRequest = await broker.call('db.quoteRequest.findOne', {
    quoteRequestId: canceledQuoteRequestEvent.quoteRequestId
  })
  await broker.call('db.quoteRequest.update', {
    id: quoteRequest.id,
    canceledQuoteRequestEvent,
    status: QUOTE_REQUEST_STATUSES.CANCELLED
  })
}

export default quoteRequestCanceled
