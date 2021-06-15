import _ from 'lodash'
import messages from '../messages'
import { sortOrders } from '../util/orders-helper'
import delay from 'delay'

const {
  viewOrderMessage,
  allOrdersCancelled,
  cancelSideAndSecurity,
  cancelSide,
  cancelSecurity
} = messages

import {
  defaultErrorMessage
} from '../lib/messageMapping'

/**
 * Handles "cancel_all_open_orders" intent
 *
 * @param {Object} ctx - Context JSON
 * @param {Object} text - Text that has already been queued to send
 * @param {Object} answer - Answer from SRE
 * @return {Array} Array of OutgoingMessage objects to be sent to the user
 */
export const handleCancelOrders = async (ctx, text, answer) => {
  let noOfCanceledOrders = 0
  let security = _.get(answer.context, 'security', null)
  let sideArg = _.get(answer.context, 'side', null)

  security = security ? security + 'USD' : null
  let side = (sideArg !== null && sideArg.toLowerCase() === 'bid') ? 'BUY' : null
  side = (sideArg !== null && sideArg.toLowerCase() === 'offer') ? 'SELL' : side

  try {
    if (side && security) {
      noOfCanceledOrders = await ctx.broker.call('mob.order.cancel.all', { security, side, traderTelegramId: ctx.params.senderId })
      if (noOfCanceledOrders > 0) {
        text = cancelSideAndSecurity(sideArg, security)
      }
    } else if (side) {
      noOfCanceledOrders = await ctx.broker.call('mob.order.cancel.all', { side, traderTelegramId: ctx.params.senderId })
      if (noOfCanceledOrders > 0) {
        text = cancelSide(sideArg)
      }
    } else if (security) {
      noOfCanceledOrders = await ctx.broker.call('mob.order.cancel.all', { security, traderTelegramId: ctx.params.senderId })
      if (noOfCanceledOrders > 0) {
        text = cancelSecurity(security)
      }
    } else {
      noOfCanceledOrders = await ctx.broker.call('mob.order.cancel.all', { traderTelegramId: ctx.params.senderId })
      if (noOfCanceledOrders > 0) {
        text = allOrdersCancelled
      }
    }

    // FIXME: Temporary fix, will be removed in the future
    await delay(500)

    let orders = await getOpenOrders(ctx.params.senderId, ctx.broker)
    if (orders.length === 0) {
      text = allOrdersCancelled
      return { text }
    } else {
      let messages = [{ text }]
      await messages.push(...orders)
      return messages
    }
  } catch (error) {
    return { text: defaultErrorMessage(error) }
  }
}

const getOpenOrders = async (telegramId, broker) => {
  const orders = await broker.call('mob.order.findOpenOrders', { telegramId })
  let messages = []

  if (orders.length === 0) {
    return messages
  } else if (orders.length === 1) {
    await messages.push(
      ...orders.map(order => ({ text: `${viewOrderMessage(order)}` }))
    )
  } else {
    const sortedOrder = sortOrders(orders)
    await messages.push(
      ...sortedOrder.map(order => ({ text: `${viewOrderMessage(order)}` }))
    )
  }

  return messages
}
