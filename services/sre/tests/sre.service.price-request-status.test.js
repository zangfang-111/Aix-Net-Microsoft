// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })
let sreQuoteRequestAnswer

describe('SRE Service - Trade Scenarios - Status query', () => {
  const PRICE_REQUEST_INTENT = 'price_request'
  const PRICE_REQUEST_START_MESSAGE =
    `Here is the latest {security} update. I am working to get you a price for  {volume} {security}. Type cancel at any time to cancel this request.`
  const PRICE_REQUEST_FIRST_PRICE_MESSAGE =
    `The tightest price we have is {market_bid}/{market_offer}, will improve if possible.`
  const PRICE_UPDATE_REQUEST_WITH_QUOTE =
    `No, the tightest price is still {market_bid}/{market_offer}`
  const PRICE_UPDATE_REQUEST_WITHOUT_QUOTE =
    `No update for now, still working for you`

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

  describe('Trade scenario with quote', () => {
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

    it('Checks answer after quote is delivered', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'where are you now?' }
        }
      })

      expect(sreAnswer.context.intent).toBe('price_status')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_UPDATE_REQUEST_WITH_QUOTE)
    })

    it('Checks answer after quote is delivered on better price', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          context: {
            scenario: 'trade',
            topic: 'better_price',
            security: 'BTC',
            volume: 7000,
            market_bid: 5500,
            market_offer: 5900
          }
        }
      })

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'where are you now?' }
        }
      })

      expect(sreAnswer.context.intent).toBe('price_status')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.market_bid).toBe(5500)
      expect(sreAnswer.context.market_offer).toBe(5900)
      expect(sreAnswer.output.text[0]).toBe(PRICE_UPDATE_REQUEST_WITH_QUOTE)
    })
  })

  describe('Trade scenario without quote', () => {
    let sreAnswer

    it('Checks answer before quote is delivered', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: { text: 'Any improvement?' }
        }
      })

      expect(sreAnswer.context.intent).toBe('price_status')
      expect(sreAnswer.output.text[0]).toBe(PRICE_UPDATE_REQUEST_WITHOUT_QUOTE)
    })
  })
})
