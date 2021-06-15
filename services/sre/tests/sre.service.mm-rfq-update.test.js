import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - Update RFQ', () => {
  const RFQ_UPDATE_MESSAGE = "/{rfq_id} Alright, I'm working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you."

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

  const offerPrice = 4800
  const bidPrice = 1200
  const rfqId = 1
  const volume = 1000
  const marketPrice = 3000
  const security = 'BTC'

  it('Market updates quote with RFQID', async () => {
    let toSRE = {}
    toSRE.input = { text: `/${rfqId} ${bidPrice}/${offerPrice}}}` }
    let sreAnswer = await broker.call('sre.send', { toSRE })

    expect(typeof sreAnswer).toEqual('object')
    expect(sreAnswer.output.text[0]).toEqual('{/validate rfq id}')
    expect(sreAnswer.context.intent).toEqual('validate_rfq_id')
    expect(sreAnswer.context.rfq_offer_price).toEqual(offerPrice)
    expect(sreAnswer.context.rfq_bid_price).toEqual(bidPrice)
    expect(sreAnswer.context.rfq_id).toEqual(rfqId)

    let sreAnswerConfirm = await broker.call('sre.send', {
      toSRE: {
        sessionId: sreAnswer.sessionId,
        context: {
          topic: 'rfq_reply',
          security: security,
          volume: volume,
          market_price: marketPrice,
          rfq_id: rfqId
        }
      }
    })
    expect(typeof sreAnswer).toEqual('object')
    expect(sreAnswerConfirm.output.text[0]).toEqual(RFQ_UPDATE_MESSAGE)
    expect(sreAnswerConfirm.context.intent).toEqual('rfq_reply')
    expect(sreAnswerConfirm.context.rfq_offer_price).toEqual(offerPrice)
    expect(sreAnswerConfirm.context.rfq_bid_price).toEqual(bidPrice)
    expect(sreAnswerConfirm.context.rfq_security).toEqual(security)
    expect(sreAnswerConfirm.context.rfq_volume).toEqual(volume)
    expect(sreAnswerConfirm.context.rfq_id).toEqual(rfqId)
    expect(sreAnswerConfirm.context.volume).toEqual(volume)
    expect(sreAnswerConfirm.context.security).toEqual(security)
    expect(sreAnswerConfirm.context.market_price).toEqual(marketPrice)
  })
})
