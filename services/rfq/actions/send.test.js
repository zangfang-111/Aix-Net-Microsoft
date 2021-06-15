import send from './send'

const callFactory = isRfqExist => (service, params) => {
  return new Promise((resolve, reject) => {
    if (service === 'db.rfq.find') {
      if (isRfqExist) {
        resolve([{
          rfqId: 1,
          financialInstrument: {
            label: 'BTC'
          }
        }])
      } else {
        resolve([])
      }
    }
    if (service === 'session.sre-initialization-data.set') {
      resolve()
    }
    if (service === 'db.financialInstrument.get') {
      resolve([{
        id: '123456789',
        label: 'BTC'
      }])
    }
    if (service === 'db.trader.getMarketMakers') {
      resolve([{
        id: '123456789',
        telegramId: 999999999,
        firstName: 'MarketMaker'
      }])
    }
    if (service === 'db.rfq.create') {
      resolve({
        id: 12345,
        rfqId: 1
      })
    }
    if (service === 'price.getCurrentTradingInfo') {
      resolve({
        PRICE: 55555
      })
    }
    if (service === 'web.pushBatch') {
      resolve()
    }
    resolve(true)
  })
}

describe(`RFQ - not send`, async () => {
  const ctx = {
    params: {
      traderId: '12345',
      quoteRequestId: 'quoteRequestId',
      security: 'BTC',
      volume: '100'
    },
    broker: {
      call: jest.fn(callFactory(true)),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('Should not send rfq message to MM if same previous rfq exist', async () => {
    await send.handler(ctx)

    // Should call DB service to find existing rfq
    expect(ctx.broker.call).nthCalledWith(1, 'db.rfq.find', {
      status: 'OPEN',
      volume: '100',
      security: 'BTC'
    })

    // Should call DB service to get Market Makers
    expect(ctx.broker.call).not.nthCalledWith(2, 'db.trader.getMarketMakers')

    // Should call DB service to get current Market price
    expect(ctx.broker.call).not.nthCalledWith(3, 'price.getCurrentTradingInfo', {
      coin: 'BTC',
      currency: 'USD'
    })

    // Should create the RFQ in the DB
    expect(ctx.broker.call).not.nthCalledWith(4, 'db.rfq.create', {
      quoteRequestId: 'quoteRequestId',
      marketMakerTelegramId: 999999999,
      security: 'BTC',
      volume: '100'
    })

    // Should set SRE Context initialization data
    expect(ctx.broker.call).not.nthCalledWith(5, 'session.sre-initialization-data.set', {
      userId: '123456789',
      sessionData: {
        'market_price': 55555,
        'rfq_id': 1,
        'security': 'BTC',
        'topic': 'rfq_reply',
        'volume': '100'
      }
    })

    // Should send message to telegram
    expect(ctx.broker.call).not.nthCalledWith(6, 'web.pushBatch', {
      messages: [
        {
          id: 999999999,
          text: `Hello MarketMaker, I'm looking for a two way price in 100 BTC, last trading at $55555 ([Source](coinroutes.com)). Price request /1.`
        }
      ]
    })
  })
})

describe(`RFQ - send`, async () => {
  const ctx = {
    params: {
      traderId: '12345',
      quoteRequestId: 'quoteRequestId',
      security: 'BTC',
      volume: '100'
    },
    broker: {
      call: jest.fn(callFactory(false)),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('Should send rfq message to MM if same previous rfq does not exist', async () => {
    await send.handler(ctx)

    // Should call DB service to find existing rfq
    expect(ctx.broker.call).nthCalledWith(1, 'db.rfq.find', {
      status: 'OPEN',
      volume: '100',
      security: 'BTC'
    })

    // Should call DB service to get Market Makers
    expect(ctx.broker.call).nthCalledWith(2, 'db.trader.getMarketMakers')

    // Should call DB service to get current Market price
    expect(ctx.broker.call).nthCalledWith(3, 'price.getCurrentTradingInfo', {
      coin: 'BTC',
      currency: 'USD'
    })

    // Should create the RFQ in the DB
    expect(ctx.broker.call).nthCalledWith(4, 'db.rfq.create', {
      quoteRequestId: 'quoteRequestId',
      marketMakerTelegramId: 999999999,
      security: 'BTC',
      volume: '100'
    })

    // Should set SRE Context initialization data
    expect(ctx.broker.call).nthCalledWith(5, 'session.sre-initialization-data.set', {
      userId: '123456789',
      sessionData: {
        'market_price': 55555,
        'rfq_id': 1,
        'security': 'BTC',
        'topic': 'rfq_reply',
        'volume': '100'
      }
    })

    // Should send message to telegram
    expect(ctx.broker.call).nthCalledWith(6, 'web.pushBatch', {
      messages: [
        {
          id: 999999999,
          text: `Hello MarketMaker, I'm looking for a two way price in 100 BTC, last trading at $55555 ([Source](coinroutes.com)). Price request /1.`
        }
      ]
    })
  })
})
