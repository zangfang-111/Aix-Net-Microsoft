// eslint-disable-next-line
const debug = require('debug')('AiX:services:rfq:actions:send')

import msgs from '../messages'

/**
 * Action that sends RFQs to Market Makers
 *
 * @param {*} ctx
 * @param {*} ctx.params
 *  quoteRequestId
 *  security
 *  volume
 */
export default {
  params: {
    quoteRequestId: { type: 'number' },
    traderId: { type: 'string' },
    security: { type: 'string' },
    volume: { type: 'number', positive: true }
  },
  async handler (ctx) {
    const currency = 'USD'
    const rfqsInDb = await ctx.broker.call('db.rfq.find', {
      status: 'OPEN',
      volume: ctx.params.volume,
      security: ctx.params.security
    })

    if (rfqsInDb.length === 0) {
      const marketMakersList = await ctx.broker.call('db.trader.getMarketMakers')

      const currentTradingInfo = await ctx.broker.call('price.getCurrentTradingInfo', {
        coin: ctx.params.security,
        currency
      })

      for (const marketMaker of marketMakersList) {
        if (marketMaker.telegramId === ctx.params.traderId) {
          continue
        }

        const rfq = await ctx.broker.call('db.rfq.create', {
          quoteRequestId: ctx.params.quoteRequestId,
          marketMakerTelegramId: marketMaker.telegramId,
          security: ctx.params.security,
          volume: ctx.params.volume
        })

        await ctx.broker.call('session.sre-initialization-data.set', {
          userId: marketMaker.id,
          sessionData: {
            topic: 'rfq_reply',
            security: ctx.params.security,
            volume: ctx.params.volume,
            market_price: currentTradingInfo.PRICE,
            rfq_id: rfq.rfqId
          }
        })

        ctx.broker.call('web.pushBatch', {
          messages: [{
            id: marketMaker.telegramId,
            text: msgs.rfqMsg(marketMaker.firstName, ctx.params.volume, ctx.params.security, currentTradingInfo.PRICE, rfq.rfqId)
          }]
        })
      }
    }
  }
}
