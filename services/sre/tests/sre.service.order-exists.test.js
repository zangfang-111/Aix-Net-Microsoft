import { ServiceBroker } from 'moleculer'
const expect = require('chai').expect

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - Order Exists Scenarios', () => {
  const scenario = 'merge'
  const MERGE_ORDER_INTENT = 'merge_order'
  const MERGE_TWO_WAY_ORDER_INTENT = 'merge_two_way_order'
  const ADD_ORDER_INTENT = 'add_order'
  const BID_ORDER_EXISTS_MESSAGE =
    `I'm already working {current_volume} {security} for {price} for you, would you like to add to this order?`
  const OFFER_ORDER_EXISTS_MESSAGE =
    `I'm already working {current_volume} {security} at {price} for you, would you like to add to this order?`
  const TWO_WAY_ORDER_EXISTS_MESSAGE =
    `I'm already working {bid}/{offer} for {current_bid_volume} {security}, would you like to add to this order?`
  const TWO_WAY_ORDER_BID_EXISTS_MESSAGE =
    `I'm already working {current_bid_volume} {security} for {bid} for you, would you like to add to this order?`
  const TWO_WAY_ORDER_OFFER_EXISTS_MESSAGE =
    `I'm already working {current_offer_volume} {security} at {offer} for you, would you like to add to this order?`
  const MERGE_BID_ORDER_SUCCESS_MESSAGE =
    `Thank you, working {volume} {security} for {price}`
  const MERGE_OFFER_ORDER_SUCCESS_MESSAGE =
    `Thank you, working {volume} {security} at {price}`
  const MERGE_TWO_WAY_ORDER_SUCCESS_MESSAGE =
    `Thank you, working {bid}/{offer} for {bid_volume} {security}`
  const MERGE_TWO_WAY_ORDER_BID_SUCCESS_MESSAGE =
    `Thank you, working {bid} for {bid_volume} {security} and {offer_volume} {security} at {offer}`
  const MERGE_TWO_WAY_ORDER_OFFER_SUCCESS_MESSAGE =
    `Thank you, working {bid} for {bid_volume} {security} and {offer_volume} {security} at {offer}`
  const MERGE_TWO_WAY_ORDER_BID_NEGATIVE =
    `Alright, still working existing bid order and working {volume} {security} at {price}.`
  const MERGE_TWO_WAY_ORDER_OFFER_NEGATIVE =
    `Alright, working {price} for {volume} {security} and continuing to work existing offer.`
  const MERGE_ORDER_NEGATIVE_MESSAGE =
    `Alright, still working existing order`

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

  describe('For BID in a One way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work a 6000 bid for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_order',
            security: sreAddOrderAnswer.context.security,
            current_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            price: sreAddOrderAnswer.context.price
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswer.output.text[0]).to.equal(BID_ORDER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'ok, do it' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(MERGE_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.volume).to.equal(sreAnswer.context.current_volume + sreAnswer.context.volume_increment)
      expect(sreAnswer.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_BID_ORDER_SUCCESS_MESSAGE)
    })

    it('Negative answer for merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_order',
            security: sreAddOrderAnswer.context.security,
            current_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            price: sreAddOrderAnswer.context.price
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswer.output.text[0]).to.equal(BID_ORDER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.output.text[0]).to.equal(MERGE_ORDER_NEGATIVE_MESSAGE)
    })
  })

  describe('For OFFER in a One way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work a 6000 offer for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_order',
            security: sreAddOrderAnswer.context.security,
            current_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            price: sreAddOrderAnswer.context.price
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswer.output.text[0]).to.equal(OFFER_ORDER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'ok, do it' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(MERGE_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.volume).to.equal(sreAnswer.context.current_volume + sreAnswer.context.volume_increment)
      expect(sreAnswer.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_OFFER_ORDER_SUCCESS_MESSAGE)
    })

    it('Negative answer for merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_order',
            security: sreAddOrderAnswer.context.security,
            current_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            price: sreAddOrderAnswer.context.price
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswer.output.text[0]).to.equal(OFFER_ORDER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.output.text[0]).to.equal(MERGE_ORDER_NEGATIVE_MESSAGE)
    })
  })

  describe('For 2 Way order - when both bid and offer order exists', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/7000 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            security: sreAddOrderAnswer.context.security,
            current_bid_volume: currentVolume,
            current_offer_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(currentVolume)
      expect(sreAnswer.context.current_offer_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(TWO_WAY_ORDER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'ok, do it' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(MERGE_TWO_WAY_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(currentVolume)
      expect(sreAnswer.context.current_offer_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid_volume).to.equal(sreAnswer.context.current_bid_volume + sreAnswer.context.volume_increment)
      expect(sreAnswer.context.offer_volume).to.equal(sreAnswer.context.current_bid_volume + sreAnswer.context.volume_increment)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })

    it('Negative answer for merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            security: sreAddOrderAnswer.context.security,
            current_bid_volume: currentVolume,
            current_offer_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(currentVolume)
      expect(sreAnswer.context.current_offer_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(TWO_WAY_ORDER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.output.text[0]).to.equal(MERGE_ORDER_NEGATIVE_MESSAGE)
    })
  })

  describe('For 2 Way order - when bid order exists', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/7000 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'bid',
            security: sreAddOrderAnswer.context.security,
            current_bid_volume: currentVolume,
            current_offer_volume: 0,
            volume_increment: sreAddOrderAnswer.context.volume,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(currentVolume)
      expect(sreAnswer.context.current_offer_volume).to.equal(0)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(TWO_WAY_ORDER_BID_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'ok, do it' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(MERGE_TWO_WAY_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(currentVolume)
      expect(sreAnswer.context.current_offer_volume).to.equal(0)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid_volume).to.equal(sreAnswer.context.current_bid_volume + sreAnswer.context.volume_increment)
      expect(sreAnswer.context.offer_volume).to.equal(sreAnswer.context.volume_increment)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_TWO_WAY_ORDER_BID_SUCCESS_MESSAGE)
    })

    it('Negative answer for merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'bid',
            security: sreAddOrderAnswer.context.security,
            current_bid_volume: currentVolume,
            current_offer_volume: 0,
            volume_increment: sreAddOrderAnswer.context.volume,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(currentVolume)
      expect(sreAnswer.context.current_offer_volume).to.equal(0)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(TWO_WAY_ORDER_BID_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(ADD_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.side).to.equal('offer')
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_TWO_WAY_ORDER_BID_NEGATIVE)
    })
  })

  describe('For 2 Way order - when offer order exists', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/7000 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'offer',
            security: sreAddOrderAnswer.context.security,
            current_bid_volume: 0,
            current_offer_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(0)
      expect(sreAnswer.context.current_offer_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(TWO_WAY_ORDER_OFFER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'ok, do it' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(MERGE_TWO_WAY_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(0)
      expect(sreAnswer.context.current_offer_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid_volume).to.equal(sreAnswer.context.volume_increment)
      expect(sreAnswer.context.offer_volume).to.equal(sreAnswer.context.current_offer_volume + sreAnswer.context.volume_increment)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_TWO_WAY_ORDER_OFFER_SUCCESS_MESSAGE)
    })

    it('Negative answer for merge orders', async () => {
      let currentVolume = 5

      let sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'offer',
            security: sreAddOrderAnswer.context.security,
            current_bid_volume: 0,
            current_offer_volume: currentVolume,
            volume_increment: sreAddOrderAnswer.context.volume,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(undefined)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.current_bid_volume).to.equal(0)
      expect(sreAnswer.context.current_offer_volume).to.equal(currentVolume)
      expect(sreAnswer.context.volume_increment).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswer.output.text[0]).to.equal(TWO_WAY_ORDER_OFFER_EXISTS_MESSAGE)

      sreAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswer.sessionId,
          input: { text: 'no' }
        }
      })

      expect(typeof sreAnswer).to.equal('object')
      expect(sreAnswer.context.intent).to.equal(ADD_ORDER_INTENT)
      expect(sreAnswer.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswer.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswer.context.side).to.equal('bid')
      expect(sreAnswer.context.price).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswer.output.text[0]).to.equal(MERGE_TWO_WAY_ORDER_OFFER_NEGATIVE)
    })
  })
})
