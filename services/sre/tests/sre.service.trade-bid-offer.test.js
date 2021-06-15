// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })
let sreQuoteRequestAnswer

describe('SRE Service - Trade Scenarios with Countr Bid/Offer', () => {
  /* eslint-disable */
  const PRICE_REQUEST_INTENT = 'price_request'
  const PRICE_REQUEST_START_MESSAGE =
    'Here is the latest {security} update. I am working to get you a price for  {volume} {security}. Type cancel at any time to cancel this request.'
  const PRICE_REQUEST_FIRST_PRICE_MESSAGE =
    'The tightest price we have is {market_bid}/{market_offer}, will improve if possible.'
  const CLARIFICATION_ON_PRICE =
    `What level do you want to work?`
  const TRADE_BID =
    'Thank you, working a ${bid_price} {side} for {volume} {security}'
  const TRADE_OFFER =
    'Thank you, working an {side} for {volume} {security} at ${offer_price}'
  /* eslint-enable */

  // runs before all tests in this block
  // eslint-disable-next-line
  beforeAll(async function () {
    jest.setTimeout(15000)
    await broker.loadService(`./services/sre/sre.service.js`)
    await broker.start()
  })

  // eslint-disable-next-line
  afterAll(function () {
    broker.stop()
  })

  beforeEach(async function () {
    let toSRE = {}
    toSRE.input = { text: 'price for 7000 btc' }
    sreQuoteRequestAnswer = await broker.call('sre.send', { toSRE })

    expect(sreQuoteRequestAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
    expect(sreQuoteRequestAnswer.context.security).toBe('BTC')
    expect(sreQuoteRequestAnswer.context.volume).toBe(7000)
    expect(sreQuoteRequestAnswer.context.display_card).toBe('crypto_rates')
    expect(sreQuoteRequestAnswer.output.text[0]).toBe(PRICE_REQUEST_START_MESSAGE)
  })

  describe('Bid on first price', () => {
    let sreAnswer

    beforeEach(async function () {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          context: {
            scenario: 'trade',
            topic: 'first_price',
            security: 'BTC',
            volume: 7000,
            market_bid: 5000,
            market_offer: 6000
          }
        }
      })

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)
    })

    it('Bid with price', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'bid 5500' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('bid')
      expect(sreAnswer.context.bid_price).toBe(5500)
      expect(sreAnswer.output.text[0]).toBe(TRADE_BID)
    })

    it('Bid without price', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'bid' }
        }
      })
      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.output.text[0]).toBe(CLARIFICATION_ON_PRICE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: '5500' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('bid')
      expect(sreAnswer.context.bid_price).toBe(5500)
      expect(sreAnswer.output.text[0]).toBe(TRADE_BID)
    })
  })

  describe('Offer on first price', () => {
    let sreAnswer

    beforeEach(async function () {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          context: {
            scenario: 'trade',
            topic: 'first_price',
            security: 'BTC',
            volume: 7000,
            market_bid: 5000,
            market_offer: 6000
          }
        }
      })

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)
    })

    it('Offer with price', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'offer 5500' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('offer')
      expect(sreAnswer.context.offer_price).toBe(5500)
      expect(sreAnswer.output.text[0]).toBe(TRADE_OFFER)
    })

    it('Offer without price', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'offer' }
        }
      })
      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.output.text[0]).toBe(CLARIFICATION_ON_PRICE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: '5500' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('offer')
      expect(sreAnswer.context.offer_price).toBe(5500)
      expect(sreAnswer.output.text[0]).toBe(TRADE_OFFER)
    })
  })
})
