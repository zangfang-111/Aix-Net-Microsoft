// eslint-disable-next-line
const debug = require('debug')('AiX:services:rfq:actions:send')

/**
 * Action that gets an active RFQ by its rfqId and traderId
 *
 * @param {*} ctx
 * @param {*} ctx.params
 *  rfqId
 *  traderId
 */
export default {
  params: {
    rfqId: { type: 'number' },
    traderId: { type: 'string' }
  },
  async handler (ctx) {
    const rfq = await ctx.broker.call('db.rfq.findOne', {
      rfqId: { $eq: ctx.params.rfqId },
      marketMakerTelegramId: { $eq: ctx.params.traderId },
      status: { $in: [ 'OPEN', 'ACTIVE' ] }
    })

    return rfq
  }
}
