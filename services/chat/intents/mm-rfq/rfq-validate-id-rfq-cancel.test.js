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
        }
      })
    }
    if (service === 'mob.order.cancel.one') {
      resolve(true)
    }
    if (service === 'sre.send') {
      resolve(sreAnswerValidateRfqCancel)
    }
    resolve(true)
  })
}

const trader = {
  telegramId: 123456789
}

const sreAnswerValidateRfqCancel = {
  sessionId: '2a426265-25938369-c085d8b5-9d17ed83',
  context:
  {
    topic: 'rfq_cancel',
    rfq_id: 2,
    intent: 'validate_rfq_id'
  },
  output: { text: ['/{rfq_id} Canceled, working nothing for you.'] }
}

describe('Chat Intents - RFQ Validate RFQ Id (rfq_cancel)', () => {
  const ctx = {
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('handleRFQValidateId() shold work as expected for valid RFQ ID and RFQ details set on context (rfq_cancel)', async () => {
    const handleRfqReplyText = await handleRFQValidateId(trader, sreAnswerValidateRfqCancel, ctx.broker)

    expect(ctx.broker.call).nthCalledWith(1, 'rfq.isActive', {
      rfqId: 2,
      traderId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(2, 'sre.send', {
      toSRE: {
        sessionId: sreAnswerValidateRfqCancel.sessionId,
        context: {
          topic: 'rfq_cancel',
          rfq_id: 2
        },
        input: { text: '' }
      }
    })

    expect(ctx.broker.call).nthCalledWith(3, 'rfq.getActiveRfq', {
      rfqId: 2,
      traderId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(4, 'mob.order.cancel.one', {
      security: 'LTC',
      userId: trader.telegramId
    })

    expect(ctx.broker.call).nthCalledWith(5, 'db.rfq.findAndUpdate', {
      find: {
        rfqId: 2,
        marketMakerTelegramId: trader.telegramId,
        status: ['OPEN', 'ACTIVE']
      },
      update: {
        status: 'CANCELLED'
      }
    })

    expect(handleRfqReplyText).toMatchObject({
      text: sreAnswerValidateRfqCancel.output.text[0]
    })
  })
})
