/**
 * Cancel one order
 *
 * @param {*} ctx
 * @param {*} ctx.params
 *  orderId
 */

import { MARKET_INSTRUMENTS } from './../constants'

const cancelOrder = {
  params: {
    security: { type: 'string', min: 3 },
    userId: { type: 'string' }
  },

  async handler (ctx) {
    const {
      security,
      userId
    } = ctx.params

    let sec = MARKET_INSTRUMENTS[security]

    let bidOrderExists = await ctx.service.mobClient.checkQuoteExists(sec, 'BUY', userId)
    if (bidOrderExists) {
      await ctx.service.mobClient.cancelOrder(bidOrderExists.id)
    }

    let offerOrderExists = await ctx.service.mobClient.checkQuoteExists(sec, 'OFFER', userId)
    if (offerOrderExists) {
      await ctx.service.mobClient.cancelOrder(offerOrderExists.id)
    }
  }
}

export default cancelOrder
