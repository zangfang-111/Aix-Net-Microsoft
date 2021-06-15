export const quoteView = quote => {
  return {
    quoteRequestId: quote.quoteRequestId,
    quantity: quote.quantity,
    status: quote.status,
    symbol: quote.symbol,
    trader: quote.trader,
    latestQuote: quote.latestQuote
  }
}

export default { quoteView }
