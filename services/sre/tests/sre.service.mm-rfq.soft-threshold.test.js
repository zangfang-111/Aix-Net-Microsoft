// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:mm-rfq')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe(`SRE Service - handle quote SOFT threshold`, () => {
  const QUOTE_SOFT_THRESHOLD_POSITIVE_SUCESS_MESSAGE = `/{rfq_id} Alright, I'm working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you.`
  const QUOTE_SOFT_THRESHOLD_NEGATIVE_SUCCESS_MESSAGE = 'Right, got it. Working nothing for now.'

  beforeAll(async function () {
    jest.setTimeout(15000)
    await broker.loadService(`./services/sre/sre.service.js`)
    await broker.start()
  })

  // es-lint-disable-next-line
  afterAll(function () {
    broker.stop()
  })

  let rfqId = 0
  let sessionId
  let sreRfqConfirm

  let sreContext = {
    intent: 'rfq_reply',
    scenario: 'confirm',
    topic: 'spread',
    reason: 'too_wide',
    rfq_bid_price: 2000,
    rfq_offer_price: 4000,
    rfq_volume: 1000,
    rfq_id: 1,
    rfq_security: 'BTC'
  }

  beforeEach(async function () {
    rfqId += 1
    let toSRE = {
      input: {
        text: '2000/4000'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: rfqId
      }
    }
    let initialAnswer = await broker.call('sre.send', { toSRE })
    sessionId = initialAnswer.sessionId

    sreContext.rfq_id = rfqId
    sreContext.intent = 'rfq_reply'
    sreRfqConfirm = await broker.call('sre.send', {
      toSRE: {
        text: '',
        sessionId: sessionId,
        context: sreContext
      }
    })
  })

  it(`Market maker confirms a quote that's is too wide`, async () => {
    sreRfqConfirm = await broker.call('sre.send', {
      toSRE: {
        sessionId: sessionId,
        input: { text: 'yes' }
      }
    })

    expect(typeof sreRfqConfirm).toEqual('object')
    expect(sreRfqConfirm.context.intent).toEqual('positive_confirm_rfq_reply')
    expect(sreRfqConfirm.context.rfq_bid_price).toEqual(2000)
    expect(sreRfqConfirm.context.rfq_offer_price).toEqual(4000)
    expect(sreRfqConfirm.context.rfq_security).toEqual(sreContext.rfq_security)
    expect(sreRfqConfirm.context.rfq_volume).toEqual(sreContext.rfq_volume)
    expect(sreRfqConfirm.context.rfq_id).toEqual(sreContext.rfq_id)
    expect(sreRfqConfirm.output.text[0]).toEqual(QUOTE_SOFT_THRESHOLD_POSITIVE_SUCESS_MESSAGE)
  })

  it(`Market maker denies a quote that's is too wide`, async () => {
    sreRfqConfirm = await broker.call('sre.send', {
      toSRE: {
        sessionId: sessionId,
        input: { text: 'no' }
      }
    })

    expect(typeof sreRfqConfirm).toEqual('object')
    expect(sreRfqConfirm.context.intent).toEqual('negative_confirm_rfq_reply')
    expect(sreRfqConfirm.context.rfq_bid_price).toEqual(sreContext.rfq_bid_price)
    expect(sreRfqConfirm.context.rfq_offer_price).toEqual(sreContext.rfq_offer_price)
    expect(sreRfqConfirm.context.rfq_security).toEqual(sreContext.rfq_security)
    expect(sreRfqConfirm.context.rfq_volume).toEqual(sreContext.rfq_volume)
    expect(sreRfqConfirm.context.rfq_id).toEqual(sreContext.rfq_id)
    expect(sreRfqConfirm.output.text[0]).toEqual(QUOTE_SOFT_THRESHOLD_NEGATIVE_SUCCESS_MESSAGE)
  })

  it(`Market maker refines a quote that's is too wide`, async () => {
    sreRfqConfirm = await broker.call('sre.send', {
      toSRE: {
        sessionId: sessionId,
        input: { text: '2500/3500' }
      }
    })

    expect(typeof sreRfqConfirm).toEqual('object')
    expect(sreRfqConfirm.context.intent).toEqual('rfq_reply')
    expect(sreRfqConfirm.context.rfq_bid_price).toEqual(2500)
    expect(sreRfqConfirm.context.rfq_offer_price).toEqual(3500)
    expect(sreRfqConfirm.context.rfq_security).toEqual(sreContext.rfq_security)
    expect(sreRfqConfirm.context.rfq_volume).toEqual(sreContext.rfq_volume)
    expect(sreRfqConfirm.context.rfq_id).toEqual(sreContext.rfq_id)
    expect(sreRfqConfirm.output.text[0]).toEqual(QUOTE_SOFT_THRESHOLD_POSITIVE_SUCESS_MESSAGE)
  })
})
