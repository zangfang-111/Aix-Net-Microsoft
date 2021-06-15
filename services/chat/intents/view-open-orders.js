import messages from '../messages'
import { sortOrders } from '../util/orders-helper'

const { noOrders, viewOrdersFirstMessage, viewOrderMessage } = messages

/**
 * Handles "view_open_orders" intent
 *
 * @param {Object} trader - Trader object
 * @param {Object} broker - Molecular broker object
 * @return {Array} Array of OutgoingMessage objects to be sent to the user
 */
export const handleViewOpenOrders = async (trader, broker) => {
  await broker.call('session.clearUserSession', { userId: trader.telegramId })

  const orders = await broker.call('mob.order.findOpenOrders', { telegramId: trader.telegramId })
  let messages = []

  if (orders.length === 0) {
    messages.push({ text: noOrders[0](trader.firstName) }, { text: noOrders[1] }, { text: noOrders[2] })
  } else {
    const sortedOrder = sortOrders(orders)
    messages.push(
      { text: viewOrdersFirstMessage(trader.firstName) },
      ...sortedOrder.map(order => ({ text: `${viewOrderMessage(order)}` }))
    )
  }

  return messages
}
