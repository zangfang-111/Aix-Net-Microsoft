// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import { handleUpdateOpenOrders } from './update-open-orders'

const prepareCtx = (callFactory) => {
  return {
    params: { senderId: trader.telegramId },
    broker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn()
      }
    }
  }
}

const trader = {
  telegramId: '123456789'
}

const updateBidPriceVolumeSreAnswer = {
  context: {
    security: 'BTC',
    side: 'bid',
    new_volume: 5500,
    new_price: 3900
  },
  output: {
    // eslint-disable-next-line
    text: ['Thank you, working a ${new_price} bid for {new_volume} {security}']
  }
}

const updateBidPriceSreAnswer = {
  context: {
    security: 'BTC',
    side: 'bid',
    new_price: 3900
  },
  output: {
    // eslint-disable-next-line
    text: ['Thank you, working a ${new_price} bid for {volume} {security}']
  }
}

const updateBidVolumeSreAnswer = {
  context: {
    security: 'BTC',
    side: 'bid',
    new_volume: 5500
  },
  output: {
    // eslint-disable-next-line
    text: ['Thank you, working a ${price} bid for {new_volume} {security}']
  }
}

const updateBidVolumeWithCurrentPriceSreAnswer = {
  context: {
    security: 'BTC',
    side: 'bid',
    new_volume: 5500
  },
  output: {
    // eslint-disable-next-line
    text: ['Thank you, working a ${price} bid for {new_volume} {security}']
  }
}

const updateBidPriceVolumeWithoutSecuritySreAnswer = {
  context: {
    side: 'bid',
    new_volume: 5500,
    new_price: 3900
  },
  output: {
    // eslint-disable-next-line
    text: ['Thank you, working a ${new_price} bid for {new_volume} {security}']
  }
}

const updateOfferPriceVolumeWithoutSecuritySreAnswer = {
  context: {
    side: 'offer',
    new_volume: 5500,
    new_price: 3900
  },
  output: {
    // eslint-disable-next-line
    text: ['Thank you, working a ${new_price} bid for {new_volume} {security}']
  }
}

describe('Intent - Update Open Orders', () => {
  describe('No open order matching the update request', () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'mob.order.findOpenOrders') {
          resolve([])
        }
        resolve(true)
      })
    }

    it('With Security & Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidPriceVolumeSreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'security': 'BTC',
        'side': 'BUY',
        'telegramId': trader.telegramId
      })
      expect(result[0]).toEqual({ text: `Hmm...it seems you don't have a matching bid order for BTC` })
    })

    it('With Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidPriceVolumeWithoutSecuritySreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'side': 'BUY',
        'telegramId': trader.telegramId
      })
      expect(result[0]).toEqual({ text: `Hmm...it seems you don't have a matching bid` })
    })

    it('With Side (Offer)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateOfferPriceVolumeWithoutSecuritySreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'side': 'SELL',
        'telegramId': trader.telegramId
      })
      expect(result[0]).toEqual({ text: `Hmm...it seems you don't have a matching offer` })
    })
  })

  describe('Multiple open orders matching the update request', () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'mob.order.findOpenOrders') {
          resolve([{ id: 'xxxx' }, { id: 'yyyy' }])
        }
        resolve(true)
      })
    }

    it('With Security & Side (Bid) - ', async () => {
      const ctx = prepareCtx(callFactory)

      const result = await handleUpdateOpenOrders(trader, updateBidPriceVolumeSreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'security': 'BTC',
        'side': 'BUY',
        'telegramId': trader.telegramId
      })

      expect(result[0]).toEqual({ text: `It seems I'm working multiple BTC bids for you. Please be more specific` })
    })

    it('With Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidPriceVolumeWithoutSecuritySreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'side': 'BUY',
        'telegramId': trader.telegramId
      })

      expect(result[0]).toEqual({ text: `It seems I'm working multiple bids for you. Please be more specific` })
    })

    it('With Side (Offer)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateOfferPriceVolumeWithoutSecuritySreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'side': 'SELL',
        'telegramId': trader.telegramId
      })

      expect(result[0]).toEqual({ text: `It seems I'm working multiple offers for you. Please be more specific` })
    })
  })

  describe('Update Price & Volume', () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'mob.order.findOpenOrders') {
          resolve([{
            id: 'xxxxx',
            security: 'BTCUSD',
            status: 'Open',
            side: 'BUY',
            trader: trader.telegramId,
            price: 11111,
            quantity: 11111,
            origQty: 11111,
            liveQty: 11111,
            execQty: 0
          }])
        }
        if (service === 'mob.order.update') {
          resolve([{
            id: 'yyyyy',
            security: 'BTCUSD',
            status: 'Open',
            side: 'BUY',
            trader: trader.telegramId,
            price: updateBidPriceVolumeSreAnswer.context.price,
            quantity: updateBidPriceVolumeSreAnswer.context.volume,
            origQty: updateBidPriceVolumeSreAnswer.context.volume,
            liveQty: updateBidPriceVolumeSreAnswer.context.volume,
            execQty: 0
          }])
        }
        resolve(true)
      })
    }

    it('With Security & Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidPriceVolumeSreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'security': 'BTC',
        'side': 'BUY',
        'telegramId': trader.telegramId
      })
      expect(ctx.broker.call).nthCalledWith(2, 'mob.order.update', {
        'id': 'xxxxx',
        'price': updateBidPriceVolumeSreAnswer.context.new_price,
        'volume': updateBidPriceVolumeSreAnswer.context.new_volume
      })
      expect(result[0]).toMatchObject({
        // eslint-disable-next-line
        text: 'Thank you, working a ${new_price} bid for {new_volume} {security}',
        contextParams: {
          security: 'BTC',
          new_price: updateBidPriceVolumeSreAnswer.context.new_price,
          new_volume: updateBidPriceVolumeSreAnswer.context.new_volume
        }
      })
    })
  })

  describe('Update Price', () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'mob.order.findOpenOrders') {
          resolve([{
            id: 'xxxxx',
            security: 'BTCUSD',
            status: 'Open',
            side: 'BUY',
            trader: trader.telegramId,
            price: 11111,
            quantity: 11111,
            origQty: 11111,
            liveQty: 11111,
            execQty: 0
          }])
        }
        if (service === 'mob.order.update') {
          resolve([{
            id: 'yyyyy',
            security: 'BTCUSD',
            status: 'Open',
            side: 'BUY',
            trader: trader.telegramId,
            price: updateBidPriceSreAnswer.context.price,
            quantity: 11111,
            origQty: 11111,
            liveQty: 11111,
            execQty: 0
          }])
        }
        resolve(true)
      })
    }

    it('With Security & Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidPriceSreAnswer, ctx.broker)

      const security = updateBidPriceSreAnswer.context.security
      const newPrice = updateBidPriceSreAnswer.context.new_price

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'security': security,
        'side': 'BUY',
        'telegramId': trader.telegramId
      })
      expect(ctx.broker.call).nthCalledWith(2, 'mob.order.update', {
        'id': 'xxxxx',
        'price': updateBidPriceSreAnswer.context.new_price,
        'volume': 11111
      })
      expect(result[0]).toMatchObject({
        // eslint-disable-next-line
        text: 'Thank you, working a ${new_price} bid for {volume} {security}',
        contextParams: {
          security: security,
          new_price: newPrice,
          volume: 11111
        }
      })
    })
  })

  describe('Update Volume', () => {
    const callFactory = () => (service, params) => {
      return new Promise((resolve, reject) => {
        if (service === 'mob.order.findOpenOrders') {
          resolve([{
            id: 'xxxxx',
            security: 'BTCUSD',
            status: 'Open',
            side: 'BUY',
            trader: trader.telegramId,
            price: 11111,
            quantity: 11111,
            origQty: 11111,
            liveQty: 11111,
            execQty: 0
          }])
        }
        if (service === 'mob.order.update') {
          resolve([{
            id: 'yyyyy',
            security: 'BTCUSD',
            status: 'Open',
            side: 'BUY',
            trader: trader.telegramId,
            price: updateBidVolumeSreAnswer.context.price,
            quantity: updateBidVolumeSreAnswer.context.volume,
            origQty: updateBidVolumeSreAnswer.context.volume,
            liveQty: updateBidVolumeSreAnswer.context.volume,
            execQty: 0
          }])
        }
        resolve(true)
      })
    }

    it('With Security & Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidVolumeSreAnswer, ctx.broker)

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'security': 'BTC',
        'side': 'BUY',
        'telegramId': trader.telegramId
      })
      expect(ctx.broker.call).nthCalledWith(2, 'mob.order.update', {
        'id': 'xxxxx',
        'price': 11111,
        'volume': updateBidVolumeSreAnswer.context.new_volume
      })
      expect(result[0]).toMatchObject({
        // eslint-disable-next-line
        text: 'Thank you, working a ${price} bid for {new_volume} {security}',
        contextParams: {
          security: 'BTC',
          new_volume: updateBidVolumeSreAnswer.context.new_volume
        }
      })
    })

    it('With current Price & Side (Bid)', async () => {
      const ctx = prepareCtx(callFactory)
      const result = await handleUpdateOpenOrders(trader, updateBidVolumeWithCurrentPriceSreAnswer, ctx.broker)

      const security = updateBidVolumeWithCurrentPriceSreAnswer.context.security

      expect(ctx.broker.call).nthCalledWith(1, 'mob.order.findOpenOrders', {
        'security': security,
        'side': 'BUY',
        'telegramId': trader.telegramId
      })
      expect(ctx.broker.call).nthCalledWith(2, 'mob.order.update', {
        'id': 'xxxxx',
        'price': 11111,
        'volume': updateBidVolumeWithCurrentPriceSreAnswer.context.new_volume
      })
      expect(result[0]).toMatchObject({
        // eslint-disable-next-line
        text: 'Thank you, working a ${price} bid for {new_volume} {security}',
        contextParams: {
          security: security,
          price: 11111,
          new_volume: 5500
        }
      })
    })
  })
})
