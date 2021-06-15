import quoteImprovedUpdate from './quote-improved-update'

const callFactory = () => (service, params) => {
  return new Promise((resolve, reject) => {
    if (service === 'sre.send') {
      resolve({
        sessionId: 100200300,
        output: { text: ['testing output'] }
      })
    }
    if (service === 'session.set') {
      resolve()
    }
    if (service === 'session.get') {
      resolve('mySessionId')
    }
    if (service === 'db.quoteRequest.create') {
      resolve({
        quoteRequestId: 447038413,
        quantity: 5000
      })
    }
    if (service === 'db.quoteRequest.findOne') {
      resolve({
        quoteRequestId: 447038413,
        quantity: 5000
      })
    }
    resolve(true)
  })
}

describe(`quoteImprovedUpdate() - should return correct values for invalid quote`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should return false when bid.price && offer.price are missing', async () => {
    const result = await quoteImprovedUpdate(123456, {}, ctx.broker)
    expect(result).toEqual(false)
  })

  it('should return false when bid.price is missing', async () => {
    const quote = {
      offer: {
        price: 5555
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)
    expect(result).toEqual(false)
  })

  it('should return false when offer.price is missing', async () => {
    const quote = {
      bid: {
        price: 5555
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)
    expect(result).toEqual(false)
  })

  it('should return false when quoteRequest quantity exceeds the quote quantity', async () => {
    await ctx.broker.call('db.quoteRequest.create')
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 4000,
      status: 'OPEN',
      bid: {
        price: 3538.81125,
        aggregated: true,
        isQuote: true,
        orders: {
          id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
          price: 3538.81125,
          status: 'OPEN',
          isQuote: true
        }
      },
      offer: {
        price: 3760.123,
        aggregated: true,
        isQuote: false,
        orders: {
          id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
          price: 3760.123,
          status: 'Open',
          isQuote: true
        }
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)
    expect(result).toEqual(false)
  })
})

/**
* ! 2 BIDS 1 OFFER
*/
describe(`quoteImprovedUpdate() - should call SRE send with correct context - 2 bids & 1 offer`, async () => {
  /* eslint-disable */
  let ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  await ctx.broker.loadService(`../../../db/db.service.js`)
  await ctx.broker.start()

  it('should call SRE send with correct context', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3500.77775,
        aggregated: true,
        isQuote: true,
        orders: [
          {
            id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
            price: 3501.1234,
            status: 'OPEN',
            isQuote: true
          },
          {
            id: '71756f7465-6b305e4f-e1d9-43cd-b43e-12b3651403f1',
            price: 3500.4321,
            status: 'OPEN',
            isQuote: true
          }
        ]
      },
      offer: {
        price: 3560.123,
        aggregated: true,
        isQuote: false,
        orders: {
          id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
          price: 3560.123,
          status: 'Open',
          isQuote: true
        }
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      toSRE: {
        sessionId: 'mySessionId',
        context: {
          scenario: 'trade',
          topic: 'better_price',
          security: 'BTC',
          volume: 5000,
          market_bid: 3500.78,
          market_offer: 3560.12
        }
      }
    }
    expect(ctx.broker.call).nthCalledWith(3, 'sre.send', sreSendParams)
  })
})

describe(`quoteImprovedUpdate() - should call WEB pushBatch with correct message - 2 bids 1 offer`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call WEB pushBatch with correct message', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3500.77775,
        aggregated: true,
        isQuote: true,
        orders: [
          {
            id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
            price: 3501.1234,
            status: 'OPEN',
            isQuote: true
          },
          {
            id: '71756f7465-6b305e4f-e1d9-43cd-b43e-12b3651403f1',
            price: 3500.4321,
            status: 'OPEN',
            isQuote: true
          }
        ]
      },
      offer: {
        price: 3560.123,
        aggregated: true,
        isQuote: false,
        orders: {
          id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
          price: 3560.123,
          status: 'Open',
          isQuote: true
        }
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      messages: [
        {
          id: 123456,
          text: 'The tightest price we have is $3500.78/$3560.12. Still working for you'
        }
      ]
    }

    expect(ctx.broker.call).nthCalledWith(6, 'web.pushBatch', sreSendParams)
  })
})

/*
/**
* ! 2 BIDS 2 OFFERS
*/
describe(`quoteImprovedUpdate() - should call SRE send with correct context - 2 bids & 2 offers`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call SRE send with correct context', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3500.77775,
        aggregated: true,
        isQuote: true,
        orders: [
          {
            id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
            price: 3501.1234,
            status: 'OPEN',
            isQuote: true
          },
          {
            id: '71756f7465-6b305e4f-e1d9-43cd-b43e-12b3651403f1',
            price: 3500.4321,
            status: 'OPEN',
            isQuote: true
          }
        ]
      },
      offer: {
        price: 3560.77775,
        aggregated: true,
        isQuote: false,
        orders: [
          {
            id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
            price: 3560.1234,
            status: 'Open',
            isQuote: true
          },
          {
            id: '6f72646572-9f00acd1-b81d-4cc3-bac2-b3db4854b332',
            price: 3561.4321,
            status: 'Open',
            isQuote: false
          }
        ]
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      toSRE: {
        sessionId: 'mySessionId',
        context: {
          scenario: 'trade',
          topic: 'better_price',
          security: 'BTC',
          volume: 5000,
          market_bid: 3500.78,
          market_offer: 3560.78
        }
      }
    }
    expect(ctx.broker.call).nthCalledWith(4, 'sre.send', sreSendParams)
  })
})

describe(`quoteImprovedUpdate() - should call WEB pushBatch with correct message - 2 bids 2 offers`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call WEB pushBatch with correct message', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3500.77775,
        aggregated: true,
        isQuote: true,
        orders: [
          {
            id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
            price: 3501.1234,
            status: 'OPEN',
            isQuote: true
          },
          {
            id: '71756f7465-6b305e4f-e1d9-43cd-b43e-12b3651403f1',
            price: 3500.4321,
            status: 'OPEN',
            isQuote: true
          }
        ]
      },
      offer: {
        price: 3560.77775,
        aggregated: true,
        isQuote: false,
        orders: [
          {
            id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
            price: 3560.1234,
            status: 'Open',
            isQuote: true
          },
          {
            id: '6f72646572-9f00acd1-b81d-4cc3-bac2-b3db4854b332',
            price: 3561.4321,
            status: 'Open',
            isQuote: false
          }
        ]
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      messages: [
        {
          id: 123456,
          text: 'The tightest price we have is $3500.78/$3560.78. Still working for you'
        }
      ]
    }

    expect(ctx.broker.call).nthCalledWith(6, 'web.pushBatch', sreSendParams)
  })
})

/**
* ! 1 BID & 2 OFFERS
*/
describe(`quoteImprovedUpdate() - should call SRE send with correct context - 1 bid & 2 offers`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call SRE send with correct context', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3538.81125,
        aggregated: true,
        isQuote: true,
        orders: {
          id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
          price: 3538.81125,
          status: 'OPEN',
          isQuote: true
        }
      },
      offer: {
        price: 3560.77775,
        aggregated: true,
        isQuote: false,
        orders: [
          {
            id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
            price: 3560.1234,
            status: 'Open',
            isQuote: true
          },
          {
            id: '6f72646572-9f00acd1-b81d-4cc3-bac2-b3db4854b332',
            price: 3561.4321,
            status: 'Open',
            isQuote: false
          }
        ]
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      toSRE: {
        sessionId: 'mySessionId',
        context: {
          scenario: 'trade',
          topic: 'better_price',
          security: 'BTC',
          volume: 5000,
          market_bid: 3538.81,
          market_offer: 3560.78
        }
      }
    }
    expect(ctx.broker.call).nthCalledWith(4, 'sre.send', sreSendParams)
  })
})

describe(`quoteImprovedUpdate() - should call WEB pushBatch with correct message - 1 bid 2 offers`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call WEB pushBatch with correct message', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3538.81125,
        aggregated: true,
        isQuote: true,
        orders: {
          id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
          price: 3501.00,
          status: 'OPEN',
          isQuote: true
        }
      },
      offer: {
        price: 3560.77775,
        aggregated: true,
        isQuote: false,
        orders: [
          {
            id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
            price: 3560.1234,
            status: 'Open',
            isQuote: true
          },
          {
            id: '6f72646572-9f00acd1-b81d-4cc3-bac2-b3db4854b332',
            price: 3561.4321,
            status: 'Open',
            isQuote: false
          }
        ]
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      messages: [
        {
          id: 123456,
          text: 'The tightest price we have is $3538.81/$3560.78. Still working for you'
        }
      ]
    }

    expect(ctx.broker.call).nthCalledWith(6, 'web.pushBatch', sreSendParams)
  })
})
/**
* ! 1 BID & 1 OFFER
*/
describe(`quoteImprovedUpdate() - should call SRE send with correct context - 1 bid & 1 offer`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call SRE send with correct context', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3538.81125,
        aggregated: true,
        isQuote: true,
        orders: {
          id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
          price: 3538.81125,
          status: 'OPEN',
          isQuote: true
        }
      },
      offer: {
        price: 3760.123,
        aggregated: true,
        isQuote: false,
        orders: {
          id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
          price: 3760.123,
          status: 'Open',
          isQuote: true
        }
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      toSRE: {
        sessionId: 'mySessionId',
        context: {
          scenario: 'trade',
          topic: 'better_price',
          security: 'BTC',
          volume: 5000,
          market_bid: 3538.81,
          market_offer: 3760.12
        }
      }
    }
    expect(ctx.broker.call).nthCalledWith(4, 'sre.send', sreSendParams)
  })
})

describe(`quoteImprovedUpdate() - should call WEB pushBatch with correct message - 1 bid 2 offers`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }

  it('should call WEB pushBatch with correct message', async () => {
    const quote = {
      quoteId: 1212240240,
      quoteRequestId: 447038413,
      symbol: 'BTCUSD',
      quantity: 5000,
      status: 'OPEN',
      bid: {
        price: 3538.81125,
        aggregated: true,
        isQuote: true,
        orders: {
          id: '71756f7465-dd819556-a327-43d7-97f6-a8ec525b28c0',
          price: 3538.81125,
          status: 'OPEN',
          isQuote: true
        }
      },
      offer: {
        price: 3760.123,
        aggregated: true,
        isQuote: false,
        orders: {
          id: '71756f7465-5d0af703-b46e-4a3a-b33e-b31d80fced2c',
          price: 3760.123,
          status: 'Open',
          isQuote: true
        }
      }
    }
    const result = await quoteImprovedUpdate(123456, quote, ctx.broker)

    expect(ctx.broker.call).toHaveBeenCalledTimes(6)
    expect(result).toEqual(true)
    const sreSendParams = {
      messages: [
        {
          id: 123456,
          text: 'The tightest price we have is $3538.81/$3760.12. Still working for you'
        }
      ]
    }

    expect(ctx.broker.call).nthCalledWith(6, 'web.pushBatch', sreSendParams)
  })
})

