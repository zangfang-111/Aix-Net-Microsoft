import quoteDegradedUpdate from './quote-degraded-update'

const degradedQuotesEvents = require('./test-data/degraded-quotes')
const createdQuotesEvents = require('./test-data/created-quotes')

const callFactory = () => (service, params) => {
  return new Promise((resolve, reject) => {
    if (service === 'sre.send') {
      resolve({
        sessionId: 100200300,
        output: { text: ['testing output'] }
      })
    }
    if (service === 'session.set') {
      resolve()
    }
    if (service === 'session.set') {
      resolve()
    }
    if (service === 'quote.create') {
      switch (params.volume) {
        case 1500:
        case 2500:
        case 3500:
          resolve(createdQuotesEvents.quoteWithValid2WayQuote)
          break
        case 4500:
          resolve(createdQuotesEvents.quoteWithInvalid2WayQuote)
          break
      }
    }
    resolve(true)
  })
}

describe(`quoteDegradedUpdate()`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('With Degraded Bid & Offer | Valid 2 way Quote - should return true and restart quote request', async () => {
    const result = await quoteDegradedUpdate(123456, degradedQuotesEvents.quoteWithBothSidesDegraded, ctx.broker)

    expect(result).toEqual(true)
    expect(ctx.broker.call).nthCalledWith(3, 'session.delete', { key: `123456_IN_ACTIVE_QUOTE_REQUEST` })

    // quote.create
    expect(ctx.broker.call).nthCalledWith(4, 'quote.create', {
      volume: degradedQuotesEvents.quoteWithBothSidesDegraded.quote.quantity,
      security: degradedQuotesEvents.quoteWithBothSidesDegraded.quote.symbol,
      traderId: 123456
    })

    // web.pushBatch
    expect(ctx.broker.call).nthCalledWith(7, 'web.pushBatch', {
      messages: [
        {
          id: 123456,
          text: 'Interest has left, The tightest price we now have is $4212.25/$4315.25.'
        }
      ]
    })
  })

  it('With Degraded Bid', async () => {
    const result = await quoteDegradedUpdate(123456, degradedQuotesEvents.quoteWithDegradedBid, ctx.broker)

    expect(result).toEqual(true)
    expect(ctx.broker.call).nthCalledWith(3, 'session.delete', { key: `123456_IN_ACTIVE_QUOTE_REQUEST` })

    // quote.create
    expect(ctx.broker.call).nthCalledWith(4, 'quote.create', {
      volume: degradedQuotesEvents.quoteWithDegradedBid.quote.quantity,
      security: degradedQuotesEvents.quoteWithDegradedBid.quote.symbol,
      traderId: 123456
    })

    // web.pushBatch
    expect(ctx.broker.call).nthCalledWith(7, 'web.pushBatch', {
      messages: [
        {
          id: 123456,
          text: 'Off that bid, The tightest we now have is $4212.25/$4315.25.'
        }
      ]
    })
  })

  it('With Degraded Offer', async () => {
    const result = await quoteDegradedUpdate(123456, degradedQuotesEvents.quoteWithDegradedOffer, ctx.broker)

    expect(result).toEqual(true)
    expect(ctx.broker.call).nthCalledWith(3, 'session.delete', { key: `123456_IN_ACTIVE_QUOTE_REQUEST` })

    // quote.create
    expect(ctx.broker.call).nthCalledWith(4, 'quote.create', {
      volume: degradedQuotesEvents.quoteWithDegradedOffer.quote.quantity,
      security: degradedQuotesEvents.quoteWithDegradedOffer.quote.symbol,
      traderId: 123456
    })

    // web.pushBatch
    expect(ctx.broker.call).nthCalledWith(7, 'web.pushBatch', {
      messages: [
        {
          id: 123456,
          text: 'Off that offer, The tightest we now have is $4212.25/$4315.25.'
        }
      ]
    })
  })

  it('With invalid 2 way Quote', async () => {
    const result = await quoteDegradedUpdate(123456, degradedQuotesEvents.quoteWithInvalid2WayQuote, ctx.broker)

    expect(result).toEqual(true)
    expect(ctx.broker.call).nthCalledWith(3, 'session.delete', { key: `123456_IN_ACTIVE_QUOTE_REQUEST` })

    // quote.create
    expect(ctx.broker.call).nthCalledWith(4, 'quote.create', {
      volume: degradedQuotesEvents.quoteWithInvalid2WayQuote.quote.quantity,
      security: degradedQuotesEvents.quoteWithInvalid2WayQuote.quote.symbol,
      traderId: 123456
    })

    // web.pushBatch
    expect(ctx.broker.call).nthCalledWith(6, 'web.pushBatch', {
      messages: [
        {
          id: 123456,
          text: 'Off that price, working to get you a new quote.'
        }
      ]
    })
  })
})
