// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })
let sreAnswer

describe('SRE Service - Update Single new_Price Orders Scenarios', () => {
  const UPDATE_OPEN_ORDER_INTENT = 'update_open_order'
  const UPDATE_OPEN_BID_ORDER_MESSAGE =
    // eslint-disable-next-line
    'Thank you, working a ${new_price} bid for {new_volume} {security}'
  const UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME =
    // eslint-disable-next-line
    'Thank you, working a ${price} bid for {new_volume} {security}'
  const UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE =
    // eslint-disable-next-line
    'Thank you, working a ${new_price} bid for {volume} {security}'
  const UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE =
    // eslint-disable-next-line
    'Thank you, working an offer for {volume} {security} at ${new_price}'
  const UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME =
    // eslint-disable-next-line
    'Thank you, working an offer for {new_volume} {security} at ${price}'
  const UPDATE_OPEN_OFFER_ORDER_MESSAGE =
    // eslint-disable-next-line
    'Thank you, working an offer for {new_volume} {security} at ${new_price}'

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

  describe('Update Price & Volume', () => {
    it('BTC - Bid with all values provided', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change my btc bid to be 3900 for 5500' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.context.new_volume).toBe(5500)
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE)
    })

    it('BTC - Offer with all values provided', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change my btc offer to be 3900 for 5500' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.context.new_volume).toBe(5500)
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE)
    })

    it('BTC - Bid with all values provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change my btc bid to be 5500 at 3900' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.context.new_volume).toBe(5500)
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE)
    })

    it('BTC - Offer with all values provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change my btc offer to be 5500 at 3900' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.context.new_volume).toBe(5500)
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE)
    })
  })

  describe('Update new_Price - Bid', () => {
    it('BTC - Bid with price provided', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'work the btc bid at 3900' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make the level 3900 on my btc bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make the level 3920 on my bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3920)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change the 3920 bid to 3930' }
        }
      })

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'price' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3930)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go up to 3940 on my btc bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_price).toBe(3940)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go up to 3950 on my bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3950)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go up to 3960 on my bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3960)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go to 3965 on my bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3965)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'up to 3970 on my bid' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3970)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'raise my bid to 3975' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3975)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_PRICE)
    })
  })

  describe('Update new_Price - Offer', () => {
    it('BTC - Offer with price provided', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'work the btc offer at 3900' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make the level 3900 on my btc offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_price).toBe(3900)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make the level 3920 on my offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3920)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change the 3920 offer to 3930' }
        }
      })

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'price' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3930)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go up to 3940 on my btc offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_price).toBe(3940)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go up to 3950 on my offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3950)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go up to 3960 on my offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3960)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'go to 3965 on my offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3965)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'up to 3970 on my offer' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3970)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'raise my offer to 3975' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_price).toBe(3975)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_PRICE)
    })
  })

  describe('Update new_volume - Bid', () => {
    it('BTC - Bid with price provided', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make the btc bid you are working for me good in 20' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make my 3500 bid for 20 btc' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change the 3500 bid to 20' }
        }
      })

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'volume' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'increase my btc bid to 20' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'increase my btc bid you are working for me to 20' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Bid with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'reduce the btc bid you are working for me to 15' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(15)
      expect(sreAnswer.context.side).toBe('bid')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_BID_ORDER_MESSAGE_VOLUME)
    })
  })

  describe('Update new_volume - Offer', () => {
    it('BTC - Offer with price provided', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make the btc offer you are working for me good in 20' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'make my 3500 offer for 20 btc' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'change the 3500 offer to 20' }
        }
      })

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'volume' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'increase my btc offer to 20' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'increase my btc offer you are working for me to 20' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(20)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME)
    })

    it('BTC - Offer with price provided - Variation', async () => {
      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          input: { text: 'reduce the btc offer you are working for me to 15' }
        }
      })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe(UPDATE_OPEN_ORDER_INTENT)
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.new_volume).toBe(15)
      expect(sreAnswer.context.side).toBe('offer')
      expect(sreAnswer.output.text[0]).toBe(UPDATE_OPEN_OFFER_ORDER_MESSAGE_VOLUME)
    })
  })
})
