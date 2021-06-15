// eslint-disable-next-line
const debug = require('debug')('AiX:services:session:actions:sre-initialization-data')
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
    userId: { type: 'string' }
  },
  async handler (ctx) {
    const sessionData = await redisClient.hgetall(`${ctx.params.userId}_SESSION_INIT_DATA`)
    return sessionData
  }
}
