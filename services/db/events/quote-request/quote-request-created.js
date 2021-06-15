import { QUOTE_REQUEST_STATUSES } from '../../constants'

async function quoteRequestCreated (initiatingTraderId, createdQuoteRequestEvent, broker) {
  const financialInstrumentLabel = createdQuoteRequestEvent.symbol.slice(0, 3)
  const financialInstruments = await broker.call('db.financialInstrument.get', { label: financialInstrumentLabel.toUpperCase() })

  await broker.call('db.quoteRequest.create', {
    initiatingTraderId,
    financialInstrumentId: financialInstruments[0].id,
    quantity: createdQuoteRequestEvent.quantity,
    quoteRequestId: createdQuoteRequestEvent.quoteRequestId,
    createdQuoteRequestEvent,
    status: QUOTE_REQUEST_STATUSES.OPEN
  })
}

export default quoteRequestCreated
