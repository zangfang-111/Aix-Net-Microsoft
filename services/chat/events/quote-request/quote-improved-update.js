import _ from 'lodash'
const debug = require('debug')('AiX:services:chat:events')
import {
  getSessionKey
} from '../../util/constants'
import {
  isTraderInActiveQuoteRequest,
  formatPriceValue
} from '../../util/chat-helper'
import botMessages from '../../messages'

async function quoteImprovedUpdate (traderId, quote, broker) {
  debug('quote.update', quote)
  broker.logger.info('< Event quote.update > ', quote)

  // Don't show the quote request end message because the trader might not be in a Quote Reuqest anymore
  // He canceled it
  // TODO: Close the streams when the trader cancels the Quote Request
  if (!(await isTraderInActiveQuoteRequest(traderId, broker))) {
    return false
  }

  const quoteRequest = await broker.call('db.quoteRequest.findOne', {
    quoteRequestId: quote.quoteRequestId
  })
  if (quoteRequest.quantity > quote.quantity) return false

  const bid = parseFloat(formatPriceValue(_.get(quote, 'bid.price', null)))
  const offer = parseFloat(formatPriceValue(_.get(quote, 'offer.price', null)))

  if (_.isNaN(bid) || _.isNaN(offer)) {
    return false
  }

  const sessionId = await broker.call('session.get', { key: getSessionKey(traderId) })
  const security = quote.symbol.replace('USD', '')
  const volume = quote.quantity
  // TODO: Use message returned from SRE to send to telegram user
  const answer = await broker.call('sre.send', {
    toSRE: {
      sessionId,
      context: {
        scenario: 'trade',
        topic: 'better_price',
        security,
        volume,
        market_bid: bid,
        market_offer: offer
      }
    }
  })

  // Set the session id again, to reset expiration timeout and make sure the session id expiration
  // is not triggered before the Quote Request is ended
  await broker.call('session.set', { key: getSessionKey(traderId), value: answer.sessionId })

  broker.call('web.pushBatch', {
    messages: [{
      id: traderId,
      text: botMessages.tightestPrice(bid, offer)
    }]
  })

  return true
}

export default quoteImprovedUpdate
