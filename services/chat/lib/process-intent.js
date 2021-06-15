import _ from 'lodash'
import handlePriceRequest from '../intents/priceRequest'
import { handleAddOrderIntent } from '../intents/add-order'
import { handleViewOpenOrders } from '../intents/view-open-orders'
import { handleViewExecutedOrders } from '../intents/view-executed-orders'
import { handleViewCurrentMarketPrice } from '../intents/view-current-market-price'
import { handleCancelOrders } from '../intents/cancel-all-open-orders'
import { handleUpdateOpenOrders } from '../intents/update-open-orders'
import { handleRFQCancel } from '../intents/mm-rfq/rfq-cancel'
import handleDisplayCard from '../intents/displayCard'
import { getSessionKey } from '../util/constants'
import {
  isTraderInActiveQuoteRequest,
  clearTraderQuoteRequest,
  getActiveQuoteRequest,
  formatPriceValue
} from '../util/chat-helper'
import {
  mapErrorMessageToSREContext,
  extendSREContext,
  mapQuoteSoftThreshold,
  mapQuoteHardThreshold,
  defaultErrorMessage
} from './messageMapping'
import {
  createAdd2WayOrderRequest,
  createAddOfferOrderRequest,
  createAddBidOrderRequest
} from './requestFactory'
import {
  handleRFQReply
} from '../intents/mm-rfq/rfq-reply'
import {
  handleRFQOneWayReply
} from '../intents/mm-rfq/rfq-reply-one-way'
import {
  handleRFQValidateId
} from '../intents/mm-rfq/rfq-validate-id'

export const handleAddOrderError = async (error, ctx, sessionId, sreContext, intent) => {
  const sessionKey = getSessionKey(ctx.params.senderId)
  const sessionSet = async data => ctx.broker.call('session.set', data)
  const sreSend = async data => ctx.broker.call('sre.send', data)
  const { senderId } = ctx.params
  let toSREContext = await mapErrorMessageToSREContext(error, senderId, sreContext, sessionSet)
  if (toSREContext === null) {
    await ctx.broker.call('session.delete', { key: sessionKey })
    return { text: defaultErrorMessage(error) }
  }
  toSREContext = extendSREContext(toSREContext, sreContext, intent)
  let sreAnswerConfirm = await sreSend({ sessionId, toSRE: { context: toSREContext } })
  if (sreAnswerConfirm !== undefined) {
    let currentPrice = await ctx.broker.call('price.getCurrentTradingInfo', {
      coin: toSREContext.security,
      currency: 'USD'
    })
    currentPrice = formatPriceValue(currentPrice.PRICE)
    await sessionSet({ key: sessionKey, value: sreAnswerConfirm.sessionId })
    return {
      text: sreAnswerConfirm.output.text[0],
      contextParams: {
        current_market_price: currentPrice
      }
    }
  }
  return {
    text: defaultErrorMessage(error)
  }
}

export const handleQuoteError = async (error, ctx, sessionId, sreContext) => {
  const sreSend = async data => ctx.broker.call('sre.send', data)
  if (error.message === 'OFFER_PRICE_OUTSIDE_SOFT_THRESHOLD' ||
    error.message === 'BID_PRICE_OUTSIDE_SOFT_THRESHOLD' ||
    error.message === 'PRICE_OUTSIDE_SOFT_THRESHOLD') {
    let toSREContext = await mapQuoteSoftThreshold(sreContext)
    let sreAnswerConfirm = await sreSend({ toSRE: { text: '', sessionId, context: toSREContext } })
    if (sreAnswerConfirm !== undefined) {
      return { text: sreAnswerConfirm.output.text[0] }
    }
  } else if (error.message === 'OFFER_PRICE_OUTSIDE_HARD_THRESHOLD' ||
    error.message === 'BID_PRICE_OUTSIDE_HARD_THRESHOLD' ||
    error.message === 'PRICE_OUTSIDE_HARD_THRESHOLD') {
    let toSREContext = await mapQuoteHardThreshold(sreContext)
    let sreAnswerConfirm = await sreSend({ toSRE: { text: '', sessionId, context: toSREContext } })
    if (sreAnswerConfirm !== undefined) {
      return { text: sreAnswerConfirm.output.text[0] }
    }
  }
  return ''
}

const resolveIntentNameFromSreAnswer = answer => {
  if (_.get(answer, 'context.display_card', null) === 'crypto_rates' && answer.context.intent === undefined) {
    return 'display_card'
  }
  if (answer.context.intent !== undefined && answer.context.scenario === undefined) {
    return answer.context.intent
  }

  return null
}
/**
 * Function to process an answer received from SRE for possible intents
 *
 * @param {Object} answer - Answer object from SRE
 * @param {Object} trader - Trader object
 * @param {Object} ctx - Molecular context
 * @returns {string} A message to be shown to the user or null if no intent present
 */
export const processIntent = async (answer, trader, ctx) => {
  let intentName = resolveIntentNameFromSreAnswer(answer)
  const sessionGet = async key => ctx.broker.call('session.get', { key })
  if (answer === undefined || answer.context === undefined || intentName === null) {
    return null
  }
  const sessionKey = getSessionKey(ctx.params.senderId)
  const sreContext = answer.context
  let text = answer.output.text[0]
  ctx.broker.logger.info('< intent >', intentName)

  switch (intentName) {
    case 'display_card': {
      return handleDisplayCard(text, answer, trader, ctx)
    }
    case 'price_request': {
      return handlePriceRequest(text, answer, trader, ctx)
    }
    case 'add_order':
    case 'update_order': {
      try {
        let order = await handleAddOrderIntent(
          ctx,
          sreContext.security,
          sreContext.side.toUpperCase(),
          sreContext.price,
          sreContext.volume,
          ctx.params.senderId,
          (intentName === 'update_order') // confirmedSoftThreshold
        )

        if (order !== null) {
          if (order.id !== null) {
            let orderToSave = {
              orderId: order.id,
              telegramId: order.trader,
              financialInstrumentLabel: sreContext.security,
              orderStatus: order.status,
              orderType: 'ONE',
              side: order.side,
              price: order.price,
              quantity: order.quantity,
              executedQuantity: 0,
              initialQuantity: order.origQty
            }
            await ctx.broker.call('db.order.create', orderToSave)
            await ctx.broker.call('session.delete', { key: sessionKey })
            text = { text }
          }
        }
      } catch (err) {
        text = handleAddOrderError(err, ctx, answer.sessionId, sreContext, 'add_order')
      }

      return text
    }

    case 'trade': {
      const noThresholdCheck = true
      let counterBid = false
      let orderSide
      let orderPrice
      switch (sreContext.action.toUpperCase()) {
        case 'BID':
          counterBid = true
          orderSide = 'BUY'
          orderPrice = sreContext.bid_price
          break

        case 'BUY':
          orderSide = 'BUY'
          orderPrice = sreContext.price
          break

        case 'OFFER':
          counterBid = true
          orderSide = 'SELL'
          orderPrice = sreContext.offer_price
          break

        case 'SELL':
          orderSide = 'SELL'
          orderPrice = sreContext.price
          break
      }

      try {
        const order = await ctx.broker.call('mob.order.add', {
          security: sreContext.security,
          side: orderSide,
          volume: sreContext.volume,
          price: orderPrice,
          telegramId: ctx.params.senderId,
          noThresholdCheck
        })

        if (order !== null) {
          if (order.id !== null) {
            let orderToSave = {
              orderId: order.id,
              telegramId: order.trader,
              financialInstrumentLabel: sreContext.security,
              orderStatus: order.status,
              orderType: 'ONE',
              side: order.side,
              price: order.price,
              quantity: order.quantity,
              executedQuantity: 0,
              initialQuantity: order.origQty
            }
            await ctx.broker.call('db.order.create', orderToSave)
            await ctx.broker.call('session.delete', { key: sessionKey })

            if (intentName === 'trade') {
              // Clear Quote Request Flow
              // TODO: Close quote streams and do some cleanup
              const activeQuateRequest = await getActiveQuoteRequest(trader.telegramId, ctx.broker)
              await ctx.call('quote.cancel', { id: activeQuateRequest.quoteRequestId })
              clearTraderQuoteRequest(trader.telegramId, ctx.broker)
            }
          }
        }
      } catch (err) {
        return handleAddOrderError(err, ctx, answer.sessionId, sreContext, 'add_order')
      }

      if (!counterBid) {
        // Not sending message to user for buy/sell. Message will be sent by order executed notification
        return {}
      } else {
        return { text }
      }
    }

    case 'add_two_way_order':
    case 'update_two_way_order': {
      try {
        const mobOderAdd2WayRequest = createAdd2WayOrderRequest(intentName, sreContext, ctx.params.senderId)
        let order = await ctx.broker.call('mob.order.add2Way', mobOderAdd2WayRequest)

        if (order !== null) {
          let orderToSave = {}
          if (order.buyOrder.id !== null) {
            orderToSave = {
              orderId: order.buyOrder.id,
              combinedId: order.sellOrder.id !== null ? order.sellOrder.id : null,
              telegramId: order.buyOrder.trader,
              financialInstrumentLabel: sreContext.security,
              orderStatus: order.buyOrder.status,
              orderType: 'TWO',
              side: order.buyOrder.side,
              price: order.buyOrder.price,
              quantity: order.buyOrder.quantity,
              executedQuantity: 0,
              initialQuantity: order.buyOrder.origQty
            }
            await ctx.broker.call('db.order.create', orderToSave)
          }
          if (order.sellOrder.id !== null) {
            orderToSave = {
              orderId: order.sellOrder.id,
              combinedId: order.buyOrder.id !== null ? order.buyOrder.id : null,
              telegramId: order.sellOrder.trader,
              financialInstrumentLabel: sreContext.security,
              orderStatus: order.sellOrder.status,
              orderType: 'TWO',
              side: order.sellOrder.side,
              price: order.sellOrder.price,
              quantity: order.sellOrder.quantity,
              executedQuantity: 0,
              initialQuantity: order.sellOrder.origQty
            }
            await ctx.broker.call('db.order.create', orderToSave)
          }

          await ctx.broker.call('session.delete', { key: sessionKey })
          text = { text }
        }
      } catch (err) {
        text = handleAddOrderError(err, ctx, answer.sessionId, sreContext, 'add_two_way_order')
      }
      return text
    }

    case 'merge_order': {
      try {
        const { volume, price } = sreContext
        const id = await sessionGet(ctx.params.senderId + '_order_exists_id')
        let orderId = await ctx.broker.call('mob.order.update', { id, volume, price })
        if (orderId !== null) {
          await ctx.broker.call('session.delete', { key: sessionKey })
          text = { text }
        }
      } catch (err) {
        text = handleAddOrderError(err, ctx, answer.sessionId, sreContext, 'add_two_way_order')
      }
      return text
    }

    case 'merge_two_way_order': {
      try {
        let bidOrderId
        let offerOrderId
        if (sreContext.current_bid_volume > 0 && sreContext.current_offer_volume > 0) {
          const { senderId } = ctx.params
          const mobOrderUpdateRequestForBid = {
            id: await sessionGet(`${senderId}_bid_order_exists_id`),
            volume: sreContext.bid_volume,
            price: sreContext.bid
          }
          const mobOrderUpdateRequestForOffer = {
            id: await sessionGet(`${senderId}_offer_order_exists_id`),
            volume: sreContext.offer_volume,
            price: sreContext.offer
          }
          bidOrderId = await ctx.broker.call('mob.order.update', mobOrderUpdateRequestForBid)
          offerOrderId = await ctx.broker.call('mob.order.update', mobOrderUpdateRequestForOffer)
        } else if (sreContext.current_bid_volume > 0) {
          // Replace BID Order
          bidOrderId = await ctx.broker.call('mob.order.update', {
            id: await sessionGet(ctx.params.senderId + '_bid_order_exists_id'),
            volume: sreContext.bid_volume,
            price: sreContext.bid
          })
          const addOfferOrderRequest = createAddOfferOrderRequest(sreContext, ctx.params.senderId)
          // Create OFFER Order
          offerOrderId = await ctx.broker.call('mob.order.add', addOfferOrderRequest)
        } else if (sreContext.current_offer_volume > 0) {
          // Replace OFFER Order
          offerOrderId = await ctx.broker.call('mob.order.update', {
            id: await sessionGet(ctx.params.senderId + '_offer_order_exists_id'),
            volume: sreContext.offer_volume,
            price: sreContext.offer
          })

          const addBidOrderRequest = createAddBidOrderRequest(sreContext, ctx.params.senderId)
          // Create BID Order
          bidOrderId = await ctx.broker.call('mob.order.add', addBidOrderRequest)
        }

        if (bidOrderId !== null && offerOrderId !== null) {
          await ctx.broker.call('session.delete', { key: sessionKey })
          text = { text }
        }
      } catch (err) {
        text = handleAddOrderError(err, ctx, answer.sessionId, sreContext, 'add_two_way_order')
      }

      return text
    }

    case 'update_open_order': {
      return handleUpdateOpenOrders(trader, answer, ctx.broker)
    }

    case 'view_open_orders': {
      return handleViewOpenOrders(trader, ctx.broker)
    }

    case 'executed_orders': {
      return handleViewExecutedOrders(trader, answer, ctx.broker)
    }

    case 'market_value': {
      return handleViewCurrentMarketPrice(text, answer.context.security, trader, ctx.broker)
    }

    // MM RFQ Intents
    case 'rfq_reply': {
      try {
        text = await handleRFQReply(trader, answer, ctx.broker)
      } catch (err) {
        text = await handleQuoteError(err, ctx, answer.sessionId, sreContext)
      }
      return text
    }

    case 'rfq_reply_one_way':
    case 'rfq_reply_oppose_way': {
      try {
        text = await handleRFQOneWayReply(trader, answer, ctx.broker)
      } catch (err) {
        text = await handleQuoteError(err, ctx, answer.sessionId, sreContext, intentName)
      }
      return text
    }

    case 'validate_rfq_id': {
      try {
        text = await handleRFQValidateId(trader, answer, ctx.broker)
      } catch (err) {
        text = await handleQuoteError(err, ctx, answer.sessionId, err.sreContext)
      }
      return text
    }

    case 'cancel': {
      if (await isTraderInActiveQuoteRequest(trader.telegramId, ctx.broker)) {
        const activeQuateRequest = await getActiveQuoteRequest(trader.telegramId, ctx.broker)
        try {
          await ctx.call('quote.cancel', { id: activeQuateRequest.quoteRequestId })
          clearTraderQuoteRequest(trader.telegramId, ctx.broker)
        } catch (error) {
          return { text: defaultErrorMessage(error) }
        }
      }
      await ctx.broker.call('session.clearUserSession', { key: sessionKey })
      return { text }
    }

    case 'cancel_all_open_orders': {
      return handleCancelOrders(ctx, text, answer)
    }

    case 'rfq_cancel': {
      try {
        return handleRFQCancel(ctx.broker, sreContext.rfq_id, trader.telegramId, answer)
      } catch (err) {
        return { text: defaultErrorMessage(err) }
      }
    }

    default:
      return null
  }
}
