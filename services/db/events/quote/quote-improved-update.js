async function quoteImprovedUpdate (improvedQuoteUpdate, broker) {
  const quoteRequest = await broker.call('db.quoteRequest.findOne', {
    quoteRequestId: improvedQuoteUpdate.quoteRequestId
  })
  let quotesUpdates = quoteRequest.quotesUpdates
  if (quotesUpdates == null) {
    quotesUpdates = []
  }
  quotesUpdates.push(improvedQuoteUpdate)
  await broker.call('db.quoteRequest.update', {
    id: quoteRequest.id,
    quotesUpdates
  })
}

export default quoteImprovedUpdate
