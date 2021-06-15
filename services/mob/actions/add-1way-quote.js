/**
 * Action that create 2way quote
 *
 * @param {*} ctx
 * @param {*} ctx.params
 *  security
 *  volume
 *  bidPrice
 *  offerPrice
 *  telegramId
 */

import { MARKET_INSTRUMENTS } from './../constants'

export default {
  params: {
    security: { type: 'string', min: 3 },
    volume: { type: 'number', positive: true, min: 0, max: 99999999 },
    bidPrice: { type: 'number', positive: true, optional: true },
    offerPrice: { type: 'number', positive: true, optional: true },
    telegramId: { type: 'number', positive: true, integer: true }
  },
  /* eslint-disable */
  async handler(ctx) {
    const {
      security,
      volume,
      price,
      side,
      telegramId
    } = ctx.params

    let buyQuote
    let sellQuote

    if (side === 'BUY') {
      const bidQuoteDetails = {
        side: 'BUY',
        quantity: volume,
        security: MARKET_INSTRUMENTS[security],
        price: price,
        traderTelegramId: telegramId
      }

      // Check IF existing Bid quote
      let bidQuoteExists = await ctx.service.mobClient.checkQuoteExists(
        bidQuoteDetails.security,
        bidQuoteDetails.side,
        bidQuoteDetails.traderTelegramId)

      // Update or create Bid/Buy quote
      if (bidQuoteExists) {
        await ctx.service.mobClient.updateOrderPriceAndVolume(bidQuoteExists.id, bidQuoteDetails.price, bidQuoteDetails.quantity)
      } else {
        buyQuote = await this.mobClient.createQuote(bidQuoteDetails)
        ctx.broker.logger.info(buyQuote)
      }
      return buyQuote
    } else {
      const offerQuoteDetails = {
        side: 'SELL',
        quantity: volume,
        security: MARKET_INSTRUMENTS[security],
        price: price,
        traderTelegramId: telegramId
      }

      // Check IF existing Offer quote
      let offerQuoteExists = await ctx.service.mobClient.checkQuoteExists(
        offerQuoteDetails.security,
        offerQuoteDetails.side,
        offerQuoteDetails.traderTelegramId)

      // Update or create Offer/Sell quote
      if (offerQuoteExists) {
        await ctx.service.mobClient.updateOrderPriceAndVolume(offerQuoteExists.id, offerQuoteDetails.price, offerQuoteDetails.quantity)
      } else {
        sellQuote = await this.mobClient.createQuote(offerQuoteDetails)
        ctx.broker.logger.info(sellQuote)
      }
      return sellQuote
    }
  }
}
