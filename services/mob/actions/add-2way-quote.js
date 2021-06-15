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

    const bidQuoteDetails = {
      side: 'BUY',
      quantity: volume,
      security: MARKET_INSTRUMENTS[security],
      price: bidPrice,
      traderTelegramId: telegramId
    }

    const offerQuoteDetails = {
      side: 'SELL',
      quantity: volume,
      security: MARKET_INSTRUMENTS[security],
      price: offerPrice,
      traderTelegramId: telegramId
    }

    // Check IF existing Bid quote
    let bidQuoteExists = await ctx.service.mobClient.checkQuoteExists(
      bidQuoteDetails.security,
      bidQuoteDetails.side,
      bidQuoteDetails.traderTelegramId)

    // Check IF existing Offer quote
    let offerQuoteExists = await ctx.service.mobClient.checkQuoteExists(
      offerQuoteDetails.security,
      offerQuoteDetails.side,
      offerQuoteDetails.traderTelegramId)

    let buyQuote
    let sellQuote

    // Update or create Bid/Buy quote
    if (bidQuoteExists) {
      await ctx.service.mobClient.updateOrderPriceAndVolume(bidQuoteExists.id, bidQuoteDetails.price, bidQuoteDetails.quantity)
    } else {
      buyQuote = await this.mobClient.createQuote(bidQuoteDetails)
      ctx.broker.logger.info(buyQuote)
    }

    // Update or create Offer/Sell quote
    if (offerQuoteExists) {
      await ctx.service.mobClient.updateOrderPriceAndVolume(offerQuoteExists.id, offerQuoteDetails.price, offerQuoteDetails.quantity)
    } else {
      sellQuote = await this.mobClient.createQuote(offerQuoteDetails)
      ctx.broker.logger.info(sellQuote)
    }

    return { buyQuote, sellQuote }
  }
}
