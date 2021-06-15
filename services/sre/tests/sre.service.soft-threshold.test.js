import { ServiceBroker } from 'moleculer'
const expect = require('chai').expect

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - Handle price SOFT threshold', () => {
  const BID_SOFT_THRESHOLD_CHECK_MESSAGE =
    `Looks like your bid is a bit wide, are you sure about that level?`
  const OFFER_SOFT_THRESHOLD_CHECK_MESSAGE =
    `Looks like your offer is a bit wide, are you sure about that level?`
  const SOFT_THRESHOLD_CHECK_MESSAGE =
    `It seems your price is a bit wide, are you sure you want to work this?`
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

    it('Trader confirms a bid that\'s to high', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(BID_SOFT_THRESHOLD_CHECK_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswerConfirm.output.text[0]).to.equal('Thank you, working a {price} bid for {volume} {security}')
    })

    it('Trader provides a different bid price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(BID_SOFT_THRESHOLD_CHECK_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'no, work 6000' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(6000)
      expect(sreAnswerConfirm.output.text[0]).to.equal('Thank you, working a {price} bid for {volume} {security}')
    })
  })

  describe('For OFFER in a One way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work a 6000 offer for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms an offer that\'s too low', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(OFFER_SOFT_THRESHOLD_CHECK_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.price).to.equal(sreAddOrderAnswer.context.price)
      expect(sreAnswerConfirm.output.text[0]).to.equal('Thank you, working an offer for {volume} {security} at {price}')
    })

    it('Trader enters a different offer price', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(OFFER_SOFT_THRESHOLD_CHECK_MESSAGE)

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
      expect(sreAnswerConfirm.output.text[0]).to.equal('Thank you, working an offer for {volume} {security} at {price}')
    })
  })

  describe('For BID in a 2 way order', () => {
    let sreAddOrderAnswer

    beforeEach(async function () {
      let toSRE = {}
      toSRE.input = { text: 'please work 6000/6500 for 10 btc' }

      sreAddOrderAnswer = await broker.call('sre.send', { toSRE })
    })

    it('Trader confirms a bid that\'s to high', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(BID_SOFT_THRESHOLD_CHECK_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })

    it('Trader updates his bid', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(BID_SOFT_THRESHOLD_CHECK_MESSAGE)

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
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'bid',
            reason: 'too_high',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(BID_SOFT_THRESHOLD_CHECK_MESSAGE)

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

    it('Trader confirms an offer that\'s to low', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(OFFER_SOFT_THRESHOLD_CHECK_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })

    it('Trader updates his offer', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(OFFER_SOFT_THRESHOLD_CHECK_MESSAGE)

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
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'offer',
            reason: 'too_low',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(OFFER_SOFT_THRESHOLD_CHECK_MESSAGE)

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

    it('Trader confirms a price that\'s to wide', async () => {
      let sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAddOrderAnswer.sessionId,
          context: {
            scenario: 'confirm',
            intent: 'add_two_way_order',
            topic: 'spread',
            security: sreAddOrderAnswer.context.security,
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
      expect(sreAnswerConfirm.output.text[0]).to.equal(SOFT_THRESHOLD_CHECK_MESSAGE)

      sreAnswerConfirm = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreAnswerConfirm.sessionId,
          input: { text: 'yes' }
        }
      })

      expect(typeof sreAnswerConfirm).to.equal('object')
      expect(sreAnswerConfirm.context.intent).to.equal('update_two_way_order')
      expect(sreAnswerConfirm.context.security).to.equal(sreAddOrderAnswer.context.security)
      expect(sreAnswerConfirm.context.volume).to.equal(sreAddOrderAnswer.context.volume)
      expect(sreAnswerConfirm.context.side).to.equal(sreAddOrderAnswer.context.side)
      expect(sreAnswerConfirm.context.bid).to.equal(sreAddOrderAnswer.context.bid)
      expect(sreAnswerConfirm.context.offer).to.equal(sreAddOrderAnswer.context.offer)
      expect(sreAnswerConfirm.output.text[0]).to.equal(TWO_WAY_ORDER_SUCCESS_MESSAGE)
    })
  })
})
