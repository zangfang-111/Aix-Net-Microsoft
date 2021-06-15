// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })
let sreQuoteRequestAnswer

describe('SRE Service - Trade Scenarios', () => {
  const PRICE_REQUEST_INTENT = 'price_request'
  const PRICE_REQUEST_START_MESSAGE =
    `Here is the latest {security} update. I am working to get you a price for  {volume} {security}. Type cancel at any time to cancel this request.`
  const PRICE_REQUEST_FIRST_PRICE_MESSAGE =
    `The tightest price we have is {market_bid}/{market_offer}, will improve if possible.`
  const PRICE_REQUEST_BUY =
    `That's done, you paid {price} for {volume} {security}`
  const PRICE_REQUEST_SELL =
    `That's done, you sold {volume} {security} at {price}`
  const PRICE_REQUEST_CHANGE_VOLUME =
    `OK, got it, getting you a price in {volume} {security}`
  const PRICE_REQUEST_CHANGE_TO_LOWER_VOLUME_WITH_VALID_PRICE =
    `{market_bid}/{market_offer} is good in {volume} {security}`
  const PRICE_REQUEST_CHANGE_VOLUME_AND_CRYPTO =
    `Got it, {security} is cancelled, getting you a price in {new_volume} {new_security}.`
  const POKE_QUESTION =
    `Are you still there?`
  const POKE_CONFIRMED_MESSAGE =
    `OK, the tightest price we have is {market_bid}/{market_offer}. This quote will expire in {timeout} seconds.`
  const CANCEL_MESSAGE =
    `Working nothing, thank you.`
  const PRICE_REQUEST_CANCEL =
    `Right, got it. Working nothing for now.`

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

  describe('Trade scenario on first price', () => {
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

    it('Buy', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'buy' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('buy')
      expect(sreAnswer.context.price).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_BUY)
    })

    it('Sell', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'sell' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('sell')
      expect(sreAnswer.context.price).toBe(5000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_SELL)
    })

    it('Cancel - Negative answer', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no thanks' }
        }
      })

      expect(sreAnswer.context.intent).toBe('cancel')
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CANCEL)
    })

    it('Cancel', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'cancel' }
        }
      })

      expect(sreAnswer.context.intent).toBe('cancel')
      expect(sreAnswer.output.text[0]).toBe(CANCEL_MESSAGE)
    })
  })

  describe('Trade scenario on better price', () => {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

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

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5500)
      expect(sreAnswer.context.market_offer).toBe(5900)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)
    })

    it('Buy', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'buy' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('buy')
      expect(sreAnswer.context.market_bid).toBe(5500)
      expect(sreAnswer.context.market_offer).toBe(5900)
      expect(sreAnswer.context.price).toBe(5900)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_BUY)
    })

    it('Sell', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'sell' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('sell')
      expect(sreAnswer.context.market_bid).toBe(5500)
      expect(sreAnswer.context.market_offer).toBe(5900)
      expect(sreAnswer.context.price).toBe(5500)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_SELL)
    })

    it('Cancel - Negative answer', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no thanks' }
        }
      })

      expect(sreAnswer.context.intent).toBe('cancel')
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CANCEL)
    })

    it('Cancel', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'cancel' }
        }
      })

      expect(sreAnswer.context.intent).toBe('cancel')
      expect(sreAnswer.output.text[0]).toBe(CANCEL_MESSAGE)
    })
  })

  describe('Trade scenario on first price with POKE', () => {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          context: {
            scenario: 'confirm',
            topic: 'poke',
            reason: 'timeout'
          }
        }
      })

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.output.text[0]).toBe(POKE_QUESTION)
    })

    it('SELL after confirmed poke', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(sreAnswer.context.intent).toBe('yes')
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(POKE_CONFIRMED_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'sell' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('sell')
      expect(sreAnswer.context.price).toBe(5000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_SELL)
    })

    it('BUY after confirmed poke', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(sreAnswer.context.intent).toBe('yes')
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(POKE_CONFIRMED_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'buy' }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.action).toBe('buy')
      expect(sreAnswer.context.price).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_BUY)
    })

    it('No to Poke', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no I dont want' }
        }
      })

      expect(sreAnswer.context.intent).toBe('cancel')
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CANCEL)
    })

    it('Cancel', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'cancel' }
        }
      })

      expect(sreAnswer.context.intent).toBe('cancel')
      expect(sreAnswer.output.text[0]).toBe(CANCEL_MESSAGE)
    })
  })

  describe('Trade scenario with volume change', () => {
    describe('Before first price', () => {
      let sreAnswer
      beforeEach(async function () {
        sreAnswer = await broker.call('sre.send', {
          toSRE: {
            sessionId: sreQuoteRequestAnswer.sessionId,
            input: {
              text: 'actually make it 200'
            }
          }
        })

        expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
        expect(sreAnswer.context.security).toBe('BTC')
        expect(sreAnswer.context.volume).toBe(200)
        expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME)
      })

      it('Changed twice before first price', async () => {
        sreAnswer = await broker.call('sre.send', {
          toSRE: {
            sessionId: sreQuoteRequestAnswer.sessionId,
            input: {
              text: 'actually make it 500'
            }
          }
        })

        expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
        expect(sreAnswer.context.security).toBe('BTC')
        expect(sreAnswer.context.volume).toBe(500)
        expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME)
      })

      it('Canceled after change before first price', async () => {
        sreAnswer = await broker.call('sre.send', {
          toSRE: {
            sessionId: sreAnswer.sessionId,
            input: { text: 'cancel' }
          }
        })

        expect(sreAnswer.context.intent).toBe('cancel')
        expect(sreAnswer.output.text[0]).toBe(CANCEL_MESSAGE)
      })

      it('Negative answer after change before first price', async () => {
        sreAnswer = await broker.call('sre.send', {
          toSRE: {
            sessionId: sreAnswer.sessionId,
            input: { text: 'no thanks' }
          }
        })

        expect(sreAnswer.context.intent).toBe('cancel')
        expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CANCEL)
      })
    })

    it('Changed after first price', async () => {
      let sreAnswer = await broker.call('sre.send', {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'actually make it 8000'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(8000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME)
    })

    it('Changed twice after first price', async () => {
      let sreAnswer = await broker.call('sre.send', {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'actually make it 8000'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(8000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'actually I meant 9000'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(9000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME)
    })

    it('Changed after first price with lower volume and buy', async () => {
      let sreAnswer = await broker.call('sre.send', {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'actually make it 5000'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(5000)
      expect(sreAnswer.context.old_volume).toBe(7000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_TO_LOWER_VOLUME_WITH_VALID_PRICE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'buy'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(5000)
      expect(sreAnswer.context.action).toBe('buy')
      expect(sreAnswer.context.price).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_BUY)
    })

    it('Changed after first price with lower volume, followed by better_price and buy', async () => {
      let sreAnswer = await broker.call('sre.send', {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'actually make it 5000'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(5000)
      expect(sreAnswer.context.old_volume).toBe(7000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_TO_LOWER_VOLUME_WITH_VALID_PRICE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          context: {
            scenario: 'trade',
            topic: 'better_price',
            security: 'BTC',
            volume: 5000,
            market_bid: 5500,
            market_offer: 5900
          }
        }
      })

      expect(sreAnswer.context.intent).toBeUndefined()
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(5000)
      expect(sreAnswer.context.market_bid).toBe(5500)
      expect(sreAnswer.context.market_offer).toBe(5900)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'buy'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe('trade')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(5000)
      expect(sreAnswer.context.action).toBe('buy')
      expect(sreAnswer.context.price).toBe(5900)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_BUY)
    })
  })

  describe('Trade scenario with volume and crypto change', () => {
    it('Changed before first price', async () => {
      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'Actually I meant 200 eth'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_security).toBe('ETH')
      expect(sreAnswer.context.new_volume).toBe(200)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME_AND_CRYPTO)
    })

    it('Changed twice before first price', async () => {
      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'make it 200 eth'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.new_security).toBe('ETH')
      expect(sreAnswer.context.new_volume).toBe(200)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME_AND_CRYPTO)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'Actually I meant 100 btc'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('ETH')
      expect(sreAnswer.context.volume).toBe(200)
      expect(sreAnswer.context.new_security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(100)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME_AND_CRYPTO)
    })

    it('Changed after first price', async () => {
      let sreAnswer = await broker.call('sre.send', {
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
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.market_bid).toBe(5000)
      expect(sreAnswer.context.market_offer).toBe(6000)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_FIRST_PRICE_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreQuoteRequestAnswer.sessionId,
          input: {
            text: 'Actually I meant 200 eth'
          }
        }
      })

      expect(sreAnswer.context.intent).toBe(PRICE_REQUEST_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_security).toBe('ETH')
      expect(sreAnswer.context.new_volume).toBe(200)
      expect(sreAnswer.output.text[0]).toBe(PRICE_REQUEST_CHANGE_VOLUME_AND_CRYPTO)
    })
  })
})
