import _ from 'lodash'
import botMessages from '../messages'
import {
  getSessionKey,
  INACTION_REMINDER_TIMEOUT
} from '../util/constants'
import chatHelper from '../util/chat-helper'
import { processIntent } from '../lib/process-intent'

async function incoming (ctx) {
  const trader = ctx.session.user
  const sreSessionId = ctx.session.sreSessionId
  let outgoingMessages = []
  // Object with params to replace placeholders in outgoing messages
  let outgoingMessagesParams = {}
  ctx.broker.logger.info('< trader message > ', ctx.params.message)

  if (trader === null) {
    return chatHelper.processOutgoing([
      botMessages.traderNotAuthorized
    ])
  }

  var toSRE = {}
  if (sreSessionId) {
    ctx.broker.logger.info('< sessionId found> ', sreSessionId)
    toSRE.sessionId = sreSessionId
  }

  // Check if there is any SRE Context Initialization data
  const sreInitContext = await ctx.broker.call('session.sre-initialization-data.get', {
    userId: trader.id
  })
  if (sreInitContext !== null && !_.isEmpty(sreInitContext)) {
    await ctx.broker.call('session.sre-initialization-data.delete', {
      userId: trader.id
    })
    toSRE.context = sreInitContext
  }

  if (ctx.params.message) {
    toSRE.input = { text: ctx.params.message }
  }

  let sreAnswer = await ctx.broker.call('sre.send', { toSRE })

  if (sreAnswer !== undefined) {
    if (sreAnswer.sessionId) {
      await ctx.broker.call('session.set', { key: getSessionKey(ctx.params.senderId), value: sreAnswer.sessionId })
    }

    const messageFromIntent = await processIntent(sreAnswer, trader, ctx)
    outgoingMessagesParams = sreAnswer.context

    if (messageFromIntent) {
      (_.isArray(messageFromIntent)) ? (outgoingMessages = outgoingMessages.concat(messageFromIntent)) : outgoingMessages.push(messageFromIntent)
      ctx.broker.logger.info(messageFromIntent)
    } else {
      sreAnswer.output.text.map((msg) => {
        outgoingMessages.push({
          text: msg
        })
      })
    }
  } else {
    outgoingMessages.push(botMessages.generalError)
  }

  if (outgoingMessages.length === 0) {
    outgoingMessages.push(botMessages.generalError)
  }

  // Add Params necessary on outgoing processing
  outgoingMessagesParams.trader = trader.firstName
  // TODO: Refactor this - find a way of setting outgoing params from different parts of the code
  const currentVolume = await ctx.broker.call('session.get', { key: ctx.params.senderId + '_order_exists_current_volume' })
  const currentBidVolume = await ctx.broker.call('session.get', { key: ctx.params.senderId + '_order_exists_current_bid_volume' })
  const currentOfferVolume = await ctx.broker.call('session.get', { key: ctx.params.senderId + '_order_exists_current_offer_volume' })
  outgoingMessagesParams.timeout = INACTION_REMINDER_TIMEOUT
  if (currentVolume) {
    outgoingMessagesParams.current_volume = currentVolume
  }
  if (currentBidVolume) {
    outgoingMessagesParams.current_bid_volume = currentBidVolume
  }
  if (currentOfferVolume) {
    outgoingMessagesParams.current_offer_volume = currentOfferVolume
  }

  return chatHelper.processOutgoing(outgoingMessages, outgoingMessagesParams)
}
export default incoming
