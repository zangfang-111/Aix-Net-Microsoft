import { MARKET_INSTRUMENTS } from './../constants'
import TwoWayOrderExistsError from '../errors/TwoWayOrderExistsError'

export default {
  params: {
    security: { type: 'string', min: 3 },
    volume: { type: 'number', positive: true, min: 0, max: 99999999 },
    bidPrice: { type: 'number', positive: true },
    offerPrice: { type: 'number', positive: true },
    telegramId: { type: 'number', positive: true, integer: true }
  },
  async handler (ctx) {
    const {
      security,
      volume,
      bidPrice,
      offerPrice,
      telegramId
    } = ctx.params

    const bidOrderDetails = {
      side: 'BUY',
      quantity: volume,
      security: MARKET_INSTRUMENTS[security],
      price: bidPrice,
      traderTelegramId: telegramId
    }

    const offerOrderDetails = {
      side: 'SELL',
      quantity: volume,
      security: MARKET_INSTRUMENTS[security],
      price: offerPrice,
      traderTelegramId: telegramId
    }

    // Check IF existing Bid order
    let bidOrderExists = await ctx.service.mobClient.checkOrderExists(
      bidOrderDetails.security,
      bidOrderDetails.side,
      bidOrderDetails.price,
      bidOrderDetails.traderTelegramId)

    // Check IF existing Offer order
    let offerOrderExists = await ctx.service.mobClient.checkOrderExists(
      offerOrderDetails.security,
      offerOrderDetails.side,
      offerOrderDetails.price,
      offerOrderDetails.traderTelegramId)

    if (bidOrderExists && offerOrderExists) {
      ctx.broker.logger.warn(`2 WAY ORDER EXISTS`)
      ctx.broker.logger.warn(bidOrderExists)
      ctx.broker.logger.warn(offerOrderExists)
      throw new TwoWayOrderExistsError(bidOrderExists, offerOrderExists)
    }

    if (bidOrderExists) {
      ctx.broker.logger.warn(`Bid Order Exists:`)
      ctx.broker.logger.warn(bidOrderExists)
      throw new TwoWayOrderExistsError(bidOrderExists, null)
    }

    if (offerOrderExists) {
      ctx.broker.logger.warn(`Offer Order Exists:`)
      ctx.broker.logger.warn(offerOrderExists)
      throw new TwoWayOrderExistsError(null, offerOrderExists)
    }

    // Create Bid/Buy order
    let buyOrder = await this.mobClient.createOrder(bidOrderDetails)
    ctx.broker.logger.info(buyOrder)

    // Create Offer/Sell order
    let sellOrder = await this.mobClient.createOrder(offerOrderDetails)
    ctx.broker.logger.info(sellOrder)

    return { buyOrder, sellOrder }
  }
}
