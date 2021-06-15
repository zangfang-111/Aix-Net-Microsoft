import quoteRequestCanceled from './quote-request-canceled'
import { RFQ_STATUSES } from '../constants'

const quoteRequest = {
  quoteRequestId: 123456
}

describe(`RFQ - quoteRequestExpired() shold work as expected`, async () => {
  it('when quoteRequestId is null', async () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'db.rfq.findAndUpdate') {
          resolve([])
        }
        resolve(true)
      })
    }

    const ctx = {
      broker: {
        call: jest.fn(callFactory()),
        logger: {
          info: jest.fn()
        }
      }
    }

    const result = await quoteRequestCanceled(null, ctx.broker)

    expect(result).toEqual(false)
    expect(ctx.broker.call).not.nthCalledWith(1, 'db.rfq.findAndUpdate')
    expect(ctx.broker.call).not.nthCalledWith(2, 'db.trader.show')
    expect(ctx.broker.call).not.nthCalledWith(3, 'session.sre-initialization-data.delete')
    expect(ctx.broker.call).not.nthCalledWith(4, 'web.pushBatch')
  })

  it('when no RFQs are found', async () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'db.rfq.findAndUpdate') {
          resolve([])
        }
        resolve(true)
      })
    }

    const ctx = {
      broker: {
        call: jest.fn(callFactory()),
        logger: {
          info: jest.fn()
        }
      }
    }

    await quoteRequestCanceled(quoteRequest, ctx.broker)

    // Should get the RFQ in the DB
    expect(ctx.broker.call).nthCalledWith(1, 'db.rfq.findAndUpdate', {
      find: { quoteRequestId: quoteRequest.quoteRequestId },
      update: { status: RFQ_STATUSES.CANCELLED }
    })
    expect(ctx.broker.call).not.nthCalledWith(2, 'db.trader.show')
    expect(ctx.broker.call).not.nthCalledWith(3, 'session.sre-initialization-data.delete')
    expect(ctx.broker.call).not.nthCalledWith(4, 'web.pushBatch')
  })

  it('with only 1 RFQ', async () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'db.rfq.findAndUpdate') {
          resolve([
            {
              id: 123,
              rfqId: 123,
              quoteRequestId: quoteRequest.quoteRequestId,
              volume: 10,
              marketMakerTelegramId: 123456789,
              financialInstrument: {
                label: 'BTC'
              }
            }
          ])
        }
        if (service === 'db.trader.show') {
          resolve({
            id: 'abcdef123456789'
          })
        }
        resolve(true)
      })
    }

    const ctx = {
      broker: {
        call: jest.fn(callFactory()),
        logger: {
          info: jest.fn()
        }
      }
    }

    await quoteRequestCanceled(quoteRequest, ctx.broker)

    // Should get the RFQ in the DB
    expect(ctx.broker.call).nthCalledWith(1, 'db.rfq.findAndUpdate', {
      find: { quoteRequestId: quoteRequest.quoteRequestId },
      update: { status: RFQ_STATUSES.CANCELLED }
    })

    expect(ctx.broker.call).nthCalledWith(2, 'db.trader.show', {
      telegramId: 123456789
    })

    // Should clear initalization data for MM
    expect(ctx.broker.call).nthCalledWith(3, 'session.sre-initialization-data.delete', {
      userId: 'abcdef123456789'
    })

    // Should send message to telegram
    expect(ctx.broker.call).nthCalledWith(4, 'web.pushBatch', {
      messages: [
        {
          id: 123456789,
          text: `/123 This 10 BTC was cancelled.`
        }
      ]
    })
  })
})
