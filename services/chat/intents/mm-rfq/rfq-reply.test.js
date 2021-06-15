// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import {
  handleRFQReply
} from './rfq-reply'

const callFactory = () => (service, params) => {
  return new Promise((resolve, reject) => {
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
    volume: 9999,
    market_price: 47.71582389,
    rfq_id: 1,
    rfq_bid_price: 46,
    rfq_offer_price: 48,
    intent: 'rfq_reply',
    rfq_security: 'LTC',
    rfq_volume: 9999
  },
  output:
  {
    text:
      ['/{rfq_id} Alright, I\'m working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you.']
  }
}

describe('Chat Intents - RFQ Reply Intent', () => {
  const ctx = {
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('handleRFQReply() shold work as expected', async () => {
    const handleRfqReplyText = await handleRFQReply(trader, sreAnswerRfqReply, ctx.broker)

    expect(ctx.broker.call).nthCalledWith(1, 'mob.quote.add2Way', {
      confirmedSoftThreshold: false,
      security: sreAnswerRfqReply.context.rfq_security,
      volume: sreAnswerRfqReply.context.rfq_volume,
      bidPrice: sreAnswerRfqReply.context.rfq_bid_price,
      offerPrice: sreAnswerRfqReply.context.rfq_offer_price,
      telegramId: trader.telegramId
    })

    expect(handleRfqReplyText).toMatchObject({
      text: sreAnswerRfqReply.output.text[0]
    })
  })
})
