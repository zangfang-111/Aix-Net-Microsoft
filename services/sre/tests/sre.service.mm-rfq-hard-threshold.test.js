import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - Handle RFQ HARD threshold', () => {
  const HARD_THRESHOLD_MESSAGE = 'We are currently not working quotes that far from spot. Please revise your bid/offer'
  const HARD_THRESHOLD_POSITIVE_MESSAGE = "/{rfq_id} Alright, I'm working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you."
  const HARD_THRESHOLD_NEGATIVE_MESSAGE = 'Right, got it. Working nothing for now.'

  let sreRfqAnswerContext = {
    scenario: 'retype',
    intent: 'rfq_reply',
    topic: 'spread',
    reason: 'too_wide',
    rfq_security: 'BTC',
    rfq_bid_price: 1000,
    rfq_offer_price: 5000,
    rfq_volume: 10,
    rfq_id: 1
  }

  // eslint-disable-next-line
  beforeAll(async function () {
    jest.setTimeout(15000)
    await broker.loadService(`./services/sre/sre.service.js`)
    await broker.start()
  })

  beforeEach(async () => {
    let toSRE = {}
    toSRE.input = { text: '1000/5000' }
    await broker.call('sre.send', { toSRE })
  })

  // eslint-disable-next-line
  afterAll(function () {
    broker.stop()
  })

  it('Market maker replies positively to hard threshold message', async () => {
    sreRfqAnswerContext.intent = 'rfq_reply'
    let sreAnswerConfirm = await broker.call('sre.send', {
      toSRE: {
        text: '',
        context: sreRfqAnswerContext
      }
    })
    expect(typeof sreAnswerConfirm).toEqual('object')
    expect(sreAnswerConfirm.context.intent).toEqual(undefined)
    expect(sreAnswerConfirm.output.text[0]).toEqual(HARD_THRESHOLD_MESSAGE)

    let sreAnswerPositive = await broker.call('sre.send', {
      toSRE: {
        sessionId: sreAnswerConfirm.sessionId,
        input: { text: '2500/2700' }
      }
    })

    expect(typeof sreAnswerPositive).toEqual('object')
    expect(sreAnswerPositive.output.text[0]).toEqual(HARD_THRESHOLD_POSITIVE_MESSAGE)
    expect(sreAnswerPositive.context.intent).toEqual('rfq_reply')
    expect(sreAnswerPositive.context.rfq_security).toEqual(sreRfqAnswerContext.rfq_security)
    expect(sreAnswerPositive.context.rfq_offer_price).toEqual(2700)
    expect(sreAnswerPositive.context.rfq_bid_price).toEqual(2500)
    expect(sreAnswerPositive.context.rfq_volume).toEqual(sreRfqAnswerContext.rfq_volume)
    expect(sreAnswerPositive.context.rfq_id).toEqual(sreRfqAnswerContext.rfq_id)
  })

  it('Market maker replies negatively to hard threshold message', async () => {
    sreRfqAnswerContext.intent = 'rfq_reply'
    let sreAnswerConfirm = await broker.call('sre.send', {
      toSRE: {
        text: '',
        context: sreRfqAnswerContext
      }
    })
    expect(typeof sreAnswerConfirm).toEqual('object')
    expect(sreAnswerConfirm.context.intent).toEqual(undefined)
    expect(sreAnswerConfirm.output.text[0]).toEqual(HARD_THRESHOLD_MESSAGE)

    let sreAnswerNegative = await broker.call('sre.send', {
      toSRE: {
        sessionId: sreAnswerConfirm.sessionId,
        input: { text: 'no' }
      }
    })
    expect(typeof sreAnswerNegative).toEqual('object')
    expect(sreAnswerNegative.output.text[0]).toEqual(HARD_THRESHOLD_NEGATIVE_MESSAGE)
    expect(sreAnswerNegative.context.intent).toEqual('negative_retype_rfq_reply')
    expect(sreAnswerNegative.context.rfq_security).toEqual(sreRfqAnswerContext.rfq_security)
    expect(sreAnswerNegative.context.rfq_bid_price).toEqual(sreRfqAnswerContext.rfq_bid_price)
    expect(sreAnswerNegative.context.rfq_offer_price).toEqual(sreRfqAnswerContext.rfq_offer_price)
    expect(sreAnswerNegative.context.rfq_volume).toEqual(sreRfqAnswerContext.rfq_volume)
    expect(sreAnswerNegative.context.rfq_id).toEqual(sreRfqAnswerContext.rfq_id)
  })
})
