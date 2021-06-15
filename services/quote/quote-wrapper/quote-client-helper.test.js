const expect = require('chai').expect

import quoteClientHelper from './quote-client-helper'

const quoteResponse = require('./test-data/quote-test-response')

describe('QuoteClientHelper', () => {
  describe('quoteView()', () => {
    it('should work as expected with expected create quote response', () => {
      const quoteView = quoteClientHelper.quoteView(quoteResponse.quoteRequest)

      expect(quoteView.quoteRequestId).to.equal(quoteResponse.quoteRequest.quoteRequestId)
      expect(quoteView.quantity).to.equal(quoteResponse.quoteRequest.quantity)
      expect(quoteView.status).to.equal(quoteResponse.quoteRequest.status)
      expect(quoteView.symbol).to.equal(quoteResponse.quoteRequest.symbol)
      expect(quoteView.trader).to.equal(quoteResponse.quoteRequest.trader)
      expect(quoteView.latestQuote).to.equal(quoteResponse.quoteRequest.latestQuote)
    })
  })
})
