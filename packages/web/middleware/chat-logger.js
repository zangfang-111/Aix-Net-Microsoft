/**
 * ChatLogger middleware
 * to save messages and commands to db
*/
import _ from 'lodash'
import { saveChat, replyWithMsg, delayTime } from '../util'

export default (broker) => async (ctx, next) => {
  try {
    const senderId = ctx.message.from.id
    const text = ctx.message.text
    saveChat(senderId, text, false, broker)

    return next(ctx).then(async res => {
      if (_.isArray(res)) {
        for (const msg of res) {
          await replyWithMsg(senderId, msg, true, ctx, broker)
          await delayTime(300)
        }
      } else {
        broker.logger.error(res)
        await replyWithMsg(senderId, res, true, ctx, broker)
      }
    })
  } catch (error) {
    broker.logger.error(error)
    return next(ctx)
  }
}
