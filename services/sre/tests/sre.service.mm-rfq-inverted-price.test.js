// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:mm-rfq')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - MM Standard 2-WAY RFQs - Handle Inverted Prices', () => {
  const QUOTE_REPLY_INTENT = 'rfq_reply'
  const QUOTE_REPLY_SUCCESS_MESSAGE =
    `/{rfq_id} Alright, I'm working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you.`
  const RFQ_INVERTED_PRICE_QUESTION =
    `Your {rfq_bid_price}/{rfq_offer_price} seems to be inverted, did you mean {rfq_offer_price}/{rfq_bid_price}?`
  const RFQ_INVERTED_PRICE_NEGATIVE_ANSWER =
    `Ok, please re-enter your price.`
  const RFQ_CANCEL_MESSAGE =
    `Right, got it. Working nothing for now.`

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

  describe('RFQ Reply With Context Set', () => {
    let sreRfqAnswer

    it('Should work as expected when MM confirms price invertion', async () => {
      let toSRE = {
        input: {
          text: '3000/2000'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 1
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(undefined)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(3000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_INVERTED_PRICE_QUESTION)

      toSRE = {
        sessionId: sreRfqAnswer.sessionId,
        input: {
          text: 'yes'
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected when MM confirms inputs new 2-WAY Price', async () => {
      let toSRE = {
        input: {
          text: '3000/2000'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 1
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(undefined)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(3000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_INVERTED_PRICE_QUESTION)

      toSRE = {
        sessionId: sreRfqAnswer.sessionId,
        input: {
          text: '2500/3500'
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2500)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3500)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected when MM answers Negatively and inputs new price', async () => {
      let toSRE = {
        input: {
          text: '3000/2000'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 1
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(undefined)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(3000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_INVERTED_PRICE_QUESTION)

      toSRE = {
        sessionId: sreRfqAnswer.sessionId,
        input: {
          text: 'no'
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe('negative_inverted_first_rfq_reply')
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_INVERTED_PRICE_NEGATIVE_ANSWER)

      toSRE = {
        sessionId: sreRfqAnswer.sessionId,
        input: {
          text: '2500/3500'
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2500)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3500)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected when MM answers Negatively twice', async () => {
      let toSRE = {
        input: {
          text: '3000/2000'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 1
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(undefined)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(3000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_INVERTED_PRICE_QUESTION)

      toSRE = {
        sessionId: sreRfqAnswer.sessionId,
        input: {
          text: 'no'
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe('negative_inverted_first_rfq_reply')
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_INVERTED_PRICE_NEGATIVE_ANSWER)

      toSRE = {
        sessionId: sreRfqAnswer.sessionId,
        input: {
          text: 'no'
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe('cancel')
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_CANCEL_MESSAGE)
    })
  })
})
