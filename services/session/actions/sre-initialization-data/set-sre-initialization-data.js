// eslint-disable-next-line
const debug = require('debug')('AiX:services:session:actions:sre-initialization-data:tests')
import { redisClient } from '../../session.service'

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
    userId: { type: 'string' },
    sessionData: { type: 'object' }
  },
  async handler (ctx) {
    const hsetKey = `${ctx.params.userId}_SESSION_INIT_DATA`
    await Object.keys(ctx.params.sessionData).forEach(async (key) => {
      let jsonValue = ctx.params.sessionData[key]
      await redisClient.hmset(hsetKey, key, jsonValue)
    })
  }
}
