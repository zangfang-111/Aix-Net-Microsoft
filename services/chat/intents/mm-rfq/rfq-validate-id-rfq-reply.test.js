// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import {
  handleRFQValidateId
} from './rfq-validate-id'

const callFactory = () => (service, params) => {
  return new Promise((resolve, reject) => {
    if (service === 'rfq.isActive') {
      resolve(1)
    }
    if (service === 'rfq.getActiveRfq') {
      resolve({
        financialInstrument: {
          label: 'LTC'
        },
        volume: 88888
      })
    }
    if (service === 'price.getCurrentTradingInfo') {
      resolve({
        PRICE: 47.71582389
      })
    }
    if (service === 'sre.send') {
      resolve(sreAnswerRfqReply)
    }
    resolve(true)
  })
}

const trader = {
  telegramId: 123456789
}

const sreAnswerRfqReply = {
  sessionId: '2a426265-25938369-c085d8b5-9d17ed83',
  context: {
    topic: 'rfq_reply',
    security: 'LTC',
    volume: 88888,
    market_price: 47.71582389,
    rfq_id: 1,
    rfq_bid_price: 46,
    rfq_offer_price: 48,
    intent: 'rfq_reply',
    rfq_security: 'LTC',
    rfq_volume: 88888
  },
  output:
  {
    text:
      ['/{rfq_id} Alright, I\'m working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you.']
  }
}

const sreAnswerValidateRfq = {
  sessionId: '2a426265-25938369-c085d8b5-9d17ed83',
  context:
  {
    topic: 'rfq_reply',
    security: 'LTC',
    volume: 88888,
    market_price: 47.70965055,
    rfq_id: 2,
    numbers: { list: [Object], pre: [Object], pairs: [Object], meta: [Object] },
    intent: 'validate_rfq_id',
    rfq_bid_price: 46,
    rfq_offer_price: 48,
    rfq_security: 'LTC',
    rfq_volume: 88888
  },
  output: { text: ['{/validate rfq id}'] }
}

const sreAnswerValidateRfqWithoutRfqDetails = {
  sessionId: '2a426265-25938369-c085d8b5-9d17ed83',
  context:
  {
    topic: 'rfq_reply',
    rfq_id: 2,
    intent: 'validate_rfq_id'
  },
  output: { text: ['{/validate rfq id}'] }
}

describe('Chat Intents - RFQ Validate RFQ Id (rfq_reply)', () => {
  const ctx = {
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('handleRFQValidateId() shold work as expected for valid RFQ ID and RFQ details set on context (rfq_reply)', async () => {
    const handleRfqReplyText = await handleRFQValidateId(trader, sreAnswerValidateRfq, ctx.broker)

    expect(ctx.broker.call).nthCalledWith(1, 'rfq.isActive', {
      rfqId: 2,
      traderId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(2, 'rfq.getActiveRfq', {
      rfqId: 2,
      traderId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(3, 'sre.send', {
      toSRE: {
        sessionId: sreAnswerRfqReply.sessionId,
        context: {
          topic: 'rfq_reply',
          security: 'LTC',
          volume: 88888,
          market_price: 47.70965055,
          rfq_id: 2
        }
      }
    })

    expect(ctx.broker.call).nthCalledWith(4, 'mob.quote.add2Way', {
      confirmedSoftThreshold: false,
      security: 'LTC',
      volume: 88888,
      bidPrice: 46,
      offerPrice: 48,
      telegramId: trader.telegramId
    })

    expect(handleRfqReplyText).toMatchObject({
      text: sreAnswerRfqReply.output.text[0]
    })
  })

  it('handleRFQValidateId() shold work as expected for valid RFQ ID and without RFQ details set on context - rfq_reply', async () => {
    const handleRfqReplyText = await handleRFQValidateId(trader, sreAnswerValidateRfqWithoutRfqDetails, ctx.broker)

    expect(ctx.broker.call).nthCalledWith(1, 'rfq.isActive', {
      rfqId: 2,
      traderId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(2, 'rfq.getActiveRfq', {
      rfqId: 2,
      traderId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(3, 'price.getCurrentTradingInfo', {
      coin: 'LTC',
      currency: 'USD'
    })

    expect(ctx.broker.call).nthCalledWith(4, 'sre.send', {
      toSRE: {
        sessionId: sreAnswerRfqReply.sessionId,
        context: {
          topic: 'rfq_reply',
          security: 'LTC',
          volume: 88888,
          market_price: 47.71582389,
          rfq_id: 2
        }
      }
    })

    expect(ctx.broker.call).nthCalledWith(5, 'mob.quote.add2Way', {
      confirmedSoftThreshold: false,
      security: 'LTC',
      volume: 88888,
      bidPrice: 46,
      offerPrice: 48,
      telegramId: trader.telegramId
    })

    expect(handleRfqReplyText).toMatchObject({
      text: sreAnswerRfqReply.output.text[0]
    })
  })
})
