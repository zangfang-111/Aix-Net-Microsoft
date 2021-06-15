// eslint-disable-next-line
const debug = require('debug')('AiX:services:rfq:actions:send')

/**
 * Action that checks if an RFQ is active
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
    const rfqCount = await ctx.broker.call('db.rfq.count', {
      rfqId: { $eq: ctx.params.rfqId },
      marketMakerTelegramId: { $eq: ctx.params.traderId },
      status: { $in: ['OPEN', 'ACTIVE'] }
    })

    if (rfqCount > 0) {
      return true
    } else {
      return false
    }
  }
}
