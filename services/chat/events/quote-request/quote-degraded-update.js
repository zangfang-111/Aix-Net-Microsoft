import _ from 'lodash'
const debug = require('debug')('AiX:services:chat:events')
import {
  getSessionKey
} from '../../util/constants'
import {
  isTraderInActiveQuoteRequest,
  clearTraderQuoteRequest,
  setTraderInActiveQuoteRequest
} from '../../util/chat-helper'
import botMessages from '../../messages'

const QUOTE_STATUSES = {
  DEGRADED: 'degraded',
  UNCHANGED: 'unchanged'
}

async function initSreWithNewPrice (traderId, broker, sessionId, security, volume, bid, offer) {
  const sreAnswer = await broker.call('sre.send', {
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
  await broker.call('session.set', { key: getSessionKey(traderId), value: sreAnswer.sessionId })
}

async function quoteDegradedUpdate (traderId, degradedQuoteUpdate, broker) {
  debug('quote.degraded', degradedQuoteUpdate)
  broker.logger.info('< Event quote.degraded > ', degradedQuoteUpdate)

  // Don't show the update because the trader might not be in a Quote Reuqest anymore
  if (!(await isTraderInActiveQuoteRequest(traderId, broker))) {
    return false
  }

  let bid = _.get(degradedQuoteUpdate, 'quote.bid.price', null)
  let offer = _.get(degradedQuoteUpdate, 'quote.offer.price', null)
  const bidStatus = _.get(degradedQuoteUpdate, 'bid', null)
  const offerStatus = _.get(degradedQuoteUpdate, 'offer', null)
  const {
    symbol,
    quantity
  } = degradedQuoteUpdate.quote
  const security = symbol.replace('USD', '')
  const sessionId = await broker.call('session.get', { key: getSessionKey(traderId) })

  clearTraderQuoteRequest(traderId, broker)

  const newQuoteReq = await broker.call('quote.create',
    {
      volume: quantity,
      security: symbol,
      traderId: traderId
    }
  )

  bid = _.get(newQuoteReq, 'latestQuote.bid.price', null)
  offer = _.get(newQuoteReq, 'latestQuote.offer.price', null)

  setTraderInActiveQuoteRequest(traderId, newQuoteReq, broker)

  let message
  if (_.isNil(bid) || _.isNil(offer)) {
    message = botMessages.degradedQuoteWithoutValidPriceMessage
  } else if (bidStatus === QUOTE_STATUSES.DEGRADED && offerStatus === QUOTE_STATUSES.UNCHANGED) {
    initSreWithNewPrice(traderId, broker, sessionId, security, quantity, bid, offer)
    message = botMessages.degradedBidQuoteMessage(bid, offer)
  } else if (bidStatus === QUOTE_STATUSES.UNCHANGED && offerStatus === QUOTE_STATUSES.DEGRADED) {
    initSreWithNewPrice(traderId, broker, sessionId, security, quantity, bid, offer)
    message = botMessages.degradedOfferQuoteMessage(bid, offer)
  } else {
    initSreWithNewPrice(traderId, broker, sessionId, security, quantity, bid, offer)
    message = botMessages.degradedQuoteMessage(bid, offer)
  }

  broker.call('web.pushBatch', {
    messages: [{
      id: traderId,
      text: message
    }]
  })

  return true
}

export default quoteDegradedUpdate
