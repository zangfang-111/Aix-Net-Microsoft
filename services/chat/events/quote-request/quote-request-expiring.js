import _ from 'lodash'
const debug = require('debug')('AiX:services:chat:events')
import {
  getSessionKey,
  INACTION_REMINDER_TIMEOUT
} from '../../util/constants'
import {
  isTraderInActiveQuoteRequest
} from '../../util/chat-helper'

async function quoteRequestExpiring ({ traderId, quote }) {
  debug('quote.request.expiring', quote)
  this.broker.logger.info('< Event quote.request.expiring > ', quote)

  if (!(await isTraderInActiveQuoteRequest(traderId, this.broker))) {
    return
  }

  let bid = _.get(quote, 'latestQuote.bid.price', null)
  let offer = _.get(quote, 'latestQuote.offer.price', null)

  let message
  if (_.isNil(bid) || _.isNil(offer)) {
    message = `OK, we didn't find a price yet but we are still working for an other ${INACTION_REMINDER_TIMEOUT} seconds, after which this price request will be closed.`
  } else {
    const sessionId = await this.broker.call('session.get', { key: getSessionKey(traderId) })
    const answer = await this.broker.call('sre.send', {
      toSRE: {
        sessionId,
        context: {
          scenario: 'confirm',
          topic: 'poke',
          reason: 'timeout'
        }
      }
    })
    // Set the session id again, to reset expiration timeout and make sure the session id expiration
    // is not triggered before the Quote Request is ended
    await this.broker.call('session.set', { key: getSessionKey(traderId), value: answer.sessionId })
    message = answer.output.text[0]
  }

  this.broker.call('web.pushBatch', {
    messages: [{
      id: traderId,
      text: message
    }]
  })
}

export default quoteRequestExpiring
