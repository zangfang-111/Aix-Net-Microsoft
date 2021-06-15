async function quoteDegradedUpdate (degradedQuoteUpdate, broker) {
  const quoteRequest = await broker.call('db.quoteRequest.findOne', {
    quoteRequestId: degradedQuoteUpdate.quoteRequestId
  })
  let quotesUpdates = quoteRequest.quotesUpdates
  if (quotesUpdates == null) {
    quotesUpdates = []
  }
  quotesUpdates.push(degradedQuoteUpdate)
  await broker.call('db.quoteRequest.update', {
    id: quoteRequest.id,
    quotesUpdates
  })
}

export default quoteDegradedUpdate
