import { ServiceBroker } from 'moleculer'
const expect = require('chai').expect

const broker = new ServiceBroker({ logger: false })

/* eslint-disable */
let current_market_price = 3456
describe('SRE Service - Handle price HARD threshold', () => {
  const scenario = 'retype'
  const HARD_THRESHOLD_MESSAGE =
    `We're currently not working prices that far from spot. Please adjust your order. {security} is trading at $` + `{current_market_price}`
  const HARD_THRESHOLD_BID_MESSAGE =
    `We’re currently not working bids that far from spot, please refresh your level. {security} is trading at $` + `{current_market_price}`
  const HARD_THRESHOLD_OFFER_MESSAGE =
    `We’re currently not working offers that far from spot, please refresh your level. {security} is trading at $` + `{current_market_price}`
  const BID_SUCCESS_MESSAGE =
    `Thank you, working a {price} bid for {volume} {security}`
  const OFFER_SUCCESS_MESSAGE =
    `Thank you, working an offer for {volume} {security} at {price}`
  const TWO_WAY_ORDER_SUCCESS_MESSAGE =
    `Thank you, working {bid}/{offer} in {volume} {security}`
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

    it('Trader provides a different bid price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            price: sreAddOrderAnswer.context.price
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_BID_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'ok, work 6000' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(6000)
      expect(sreAnswerConfirm.output.text[0]).to.equal(BID_SUCCESS_MESSAGE)
    })
  })

  describe('For OFFER in a One way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work a 6000 offer for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader enters a different offer price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            price: sreAddOrderAnswer.context.price
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_OFFER_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'actually work 5555' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(5555)
      expect(sreAnswerConfirm.output.text[0]).to.equal(OFFER_SUCCESS_MESSAGE)
    })
  })

  describe('For BID in a 2 way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/6500 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader updates his bid', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_BID_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'bid 6100' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(6100)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })

    it('Trader updates his previous price with a new 2-way price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_BID_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: '6100/6200' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(6100)
      expect(sreAnswerConfirm.context.offer).to.equal(6200)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })
  })

  describe('For OFFER in a 2 way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/6500 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader updates his offer', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_OFFER_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'offer 6700' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(6700)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })

    it('Trader updates his previous price with a new 2-way price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario,
            intent: 'add_two_way_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_OFFER_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: '6100/6200' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(6100)
      expect(sreAnswerConfirm.context.offer).to.equal(6200)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })
  })

  describe('For BOTH BID & OFFER in a 2 way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/6500 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader updates his previous price with a new 2-way price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'retype',
            intent: 'add_two_way_order',
            topic: 'spread',
            security: sreAddOrderAnswer.context.security,
            current_market_price,
            volume: sreAddOrderAnswer.context.volume,
            side: sreAddOrderAnswer.context.side,
            bid: sreAddOrderAnswer.context.bid,
            offer: sreAddOrderAnswer.context.offer
          }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal(undefined)
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(HARD_THRESHOLD_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: '6100/6200' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(6100)
      expect(sreAnswerConfirm.context.offer).to.equal(6200)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })
  })
})
