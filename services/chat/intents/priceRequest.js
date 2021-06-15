import moment from 'moment'
import _ from 'lodash'
// eslint-disable-next-line
const debug = require('debug')('AiX:services:chat:intents:price-request')
import {
  isTraderInActiveQuoteRequest,
  getActiveQuoteRequest,
  setTraderInActiveQuoteRequest,
  clearTraderQuoteRequest
} from '../util/chat-helper'
import {
  getSessionKey
} from '../util/constants'
import messages from '../messages/index'
const { infoCardCaption } = messages
import {
  defaultErrorMessage
} from '../lib/messageMapping'

const priceRequestUpdatedToLowerVolume = (oldVolume, volume) => {
  return (oldVolume !== null && oldVolume > volume)
}

const priceRequestUpdatedToLowerVolumeWithValidPrice = (bid, offer, oldMarketBid, oldMarketOffer) => {
  return (bid !== null && offer !== null && bid === oldMarketBid && offer === oldMarketOffer)
}

const sendRfqToMarketMakers = (broker, traderId, quoteRequestId, security, volume) => {
  broker.call('rfq.send', {
    traderId,
    quoteRequestId,
    security,
    volume
  })
}

const handlePriceRequest = async (text, answer, trader, ctx) => {
  const currency = 'USD'
  const botAnswers = []
  let firstTextAnswer = text
  let { security, volume } = answer.context
  const newSecurity = _.get(answer.context, 'new_security', null)
  const newVolume = _.get(answer.context, 'new_volume', null)
  // Used when changing volume of ongoing price request to lower value
  const oldVolume = _.get(answer.context, 'old_volume', null)
  const oldMarketBid = _.get(answer.context, 'market_bid', null)
  const oldMarketOffer = _.get(answer.context, 'market_offer', null)

  // Handle the case when trader changes crypto and volume
  if (newSecurity !== null && newVolume !== null) {
    security = newSecurity
    volume = newVolume
  }

  if (await isTraderInActiveQuoteRequest(trader.telegramId, ctx.broker)) {
    const activeQuoteRequest = await getActiveQuoteRequest(trader.telegramId, ctx.broker)
    try {
      await ctx.broker.call('quote.cancel', { id: activeQuoteRequest.quoteRequestId })
    } catch (error) {
    }
  }

  const tradingInfo = await ctx.broker.call('price.getCurrentTradingInfo', {
    coin: security,
    currency
  })

  const url = await ctx.broker.call('price.createInfoCard', {
    telegramId: trader.telegramId,
    content: {
      coin: tradingInfo.FROMSYMBOL,
      currency: tradingInfo.TOSYMBOL,
      currentPrice: tradingInfo.PRICE,
      now: moment(tradingInfo.LASTUPDATE).format('h:mm:ss a') || moment().format('h:mm:ss a'),
      currencySymbol: '$',
      dayLowPrice: tradingInfo.LOWDAY,
      dayHighPrice: tradingInfo.HIGHDAY
    }
  })

  let quoteRequest
  try {
    quoteRequest = await ctx.broker.call('quote.create',
      {
        volume,
        security: `${security}${currency}`,
        traderId: trader.telegramId
      }
    )
  } catch (error) {
    clearTraderQuoteRequest(trader.telegramId, ctx.broker)
    await ctx.broker.call('session.clearUserSession', { key: getSessionKey(trader.telegramId) })
    return { text: defaultErrorMessage(error) }
  }

  ctx.broker.broadcast('quote.request.created', {
    initiatingTraderId: trader.id,
    createdQuoteRequestEvent: quoteRequest
  })

  setTraderInActiveQuoteRequest(trader.telegramId, quoteRequest, ctx.broker)

  const sessionId = await ctx.broker.call('session.get', { key: getSessionKey(trader.telegramId) })
  const bid = _.get(quoteRequest, 'latestQuote.bid.price', null)
  const offer = _.get(quoteRequest, 'latestQuote.offer.price', null)
  let sreTopic = 'first_price'

  if (priceRequestUpdatedToLowerVolume(oldVolume, volume) && priceRequestUpdatedToLowerVolumeWithValidPrice(bid, offer, oldMarketBid, oldMarketOffer)) {
    botAnswers.push({
      text: answer.output.text[0],
      contextParams: {
        market_bid: bid,
        market_offer: offer
      }
    })
    return botAnswers
  } else if (priceRequestUpdatedToLowerVolume(oldVolume, volume)) {
    sreTopic = 'better_price'
    firstTextAnswer = `Ok, working to get you a price for ${volume} ${security}/USD. Type cancel at any time to cancel this request`
  }

  if (_.isNil(bid) || _.isNil(offer)) {
    sendRfqToMarketMakers(ctx.broker, trader.telegramId, quoteRequest.quoteRequestId, security, volume)

    botAnswers.push({
      text: firstTextAnswer,
      imageUrl: url,
      caption: infoCardCaption
    })
    return botAnswers
  }

  botAnswers.push({
    text: firstTextAnswer,
    imageUrl: url,
    caption: infoCardCaption
  })

  const answerFirstPrice = await ctx.broker.call('sre.send', {
    toSRE: {
      sessionId,
      context: {
        scenario: 'trade',
        topic: sreTopic,
        security,
        volume,
        market_bid: bid,
        market_offer: offer
      }
    }
  })

  botAnswers.push({
    text: answerFirstPrice.output.text[0],
    contextParams: {
      market_bid: bid,
      market_offer: offer
    }
  })

  return botAnswers
}

export default handlePriceRequest
