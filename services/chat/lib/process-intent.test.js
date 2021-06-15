import {
  handleAddOrderError
} from './process-intent'

const intent = 'any_other_than_add_or_update_two_way_order'
const sessionId = 'mySessionId'
const sreContext = {
  security: 'sreSecurity',
  volume: 100
}
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
    if (service === 'price.getCurrentTradingInfo') {
      resolve({
        PRICE: 3456.1234
      })
    }
    resolve(true)
  })
}
describe(`PRICE_OUTSIDE_SOFT_THRESHOLD different intent than add  or update two_way_order"`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  it('should call sre send with correct context', async () => {
    let error = { message: 'PRICE_OUTSIDE_SOFT_THRESHOLD' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
    const sreSendParams = {
      sessionId: 'mySessionId',
      toSRE: {
        context: {
          scenario: 'confirm',
          topic: 'spread',
          intent: 'any_other_than_add_or_update_two_way_order',
          security: 'sreSecurity',
          volume: 100
        }
      }
    }
    expect(ctx.broker.call).nthCalledWith(1, 'sre.send', sreSendParams)
    expect(ctx.broker.call).nthCalledWith(3, 'session.set', { key: '100200_SRE_SESSION_ID', value: 100200300 })
  })
})

describe('PRICE_OUTSIDE_HARD_THRESHOLD different intent than add  or update two_way_order', async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  test('PRICE_OUTSIDE_HARD_THRESHOLD ', async () => {
    let error = { message: 'PRICE_OUTSIDE_HARD_THRESHOLD' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})

describe('BID_PRICE_OUTSIDE_SOFT_THRESHOLD', () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  test('BID_PRICE_OUTSIDE_SOFT_THRESHOLD ', async () => {
    let error = { message: 'BID_PRICE_OUTSIDE_SOFT_THRESHOLD' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})

describe('BID_PRICE_OUTSIDE_HARD_THRESHOLD', () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  test('BID_PRICE_OUTSIDE_HARD_THRESHOLD ', async () => {
    let error = { message: 'BID_PRICE_OUTSIDE_HARD_THRESHOLD' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})

describe('OFFER_PRICE_OUTSIDE_SOFT_THRESHOLD', () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  test('OFFER_PRICE_OUTSIDE_SOFT_THRESHOLD ', async () => {
    let error = { message: 'OFFER_PRICE_OUTSIDE_SOFT_THRESHOLD' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})

describe('OFFER_PRICE_OUTSIDE_HARD_THRESHOLD', () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  test('OFFER_PRICE_OUTSIDE_HARD_THRESHOLD ', async () => {
    let error = { message: 'OFFER_PRICE_OUTSIDE_HARD_THRESHOLD' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})

describe('ORDER_EXISTS_ERROR', () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  test('ORDER_EXISTS_ERROR ', async () => {
    let error = {
      message: 'ORDER_EXISTS_ERROR',
      data: {
        id: 100,
        quantity: 8
      }
    }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(5)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})

describe('TWO_WAY_ORDER_EXISTS_ERROR', () => {
  test('TWO_WAY_ORDER_EXISTS_ERROR, with bidOrder and offerOrder not null', async () => {
    let error = {
      message: 'TWO_WAY_ORDER_EXISTS_ERROR',
      data: {
        id: 100,
        quantity: 8,
        bidOrder: { quantity: 100, id: 'bid100' },
        offerOrder: { quantity: 200, id: 'off100' }
      }
    }
    const ctx = {
      params: { senderId: 100200 },
      broker: {
        call: jest.fn(callFactory())
      }
    }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(7)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
  test('TWO_WAY_ORDER_EXISTS_ERROR, with bidOrder null and offerOrder not null', async () => {
    const ctx = {
      params: { senderId: 100200 },
      broker: {
        call: jest.fn(callFactory())
      }
    }
    let error = {
      message: 'TWO_WAY_ORDER_EXISTS_ERROR',
      data: {
        id: 100,
        quantity: 8,
        bidOrder: null,
        offerOrder: { quantity: 200, id: 'off100' }
      }
    }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(5)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
  test('TWO_WAY_ORDER_EXISTS_ERROR, with bidOrder not null and offerOrder null', async () => {
    const ctx = {
      params: { senderId: 100200 },
      broker: {
        call: jest.fn(callFactory())
      }
    }
    let error = {
      message: 'TWO_WAY_ORDER_EXISTS_ERROR',
      data: {
        id: 100,
        quantity: 8,
        bidOrder: { quantity: 100, id: 'bid100' },
        offerOrder: null
      }
    }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(5)
    expect(result).toEqual({ contextParams: { 'current_market_price': '3456.12' }, text: 'testing output' })
  })
})
describe(`DEFAULT_CASE"`, async () => {
  const ctx = {
    params: { senderId: 100200 },
    broker: {
      call: jest.fn(callFactory())
    }
  }
  it('should call sre send with correct context', async () => {
    let error = { message: 'DOES_NOT_MATCH_ANY_EXISTING' }
    const result = await handleAddOrderError(error, ctx, sessionId, sreContext, intent)
    expect(ctx.broker.call).toHaveBeenCalledTimes(1)
    expect(result).toEqual({ text: 'DOES_NOT_MATCH_ANY_EXISTING' })
  })
})
