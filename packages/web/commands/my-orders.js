import messages from './messages'
import { sortOrders } from '../util'

const { noOrder, firstMessage, orderMessage } = messages

export const myOrdersCommand = async (ctx, broker) => {
  const user = ctx.message.from

  await broker.call('session.clearUserSession', { userId: user.id })

  const orders = await broker.call('mob.order.findOpenOrders', { telegramId: user.id })
  let messages = []

  if (orders.length === 0) {
    messages.push({ text: noOrder[0](user.first_name) }, { text: noOrder[1] }, { text: noOrder[2] })
  } else {
    const sortedOrder = sortOrders(orders)
    messages.push(
      { text: firstMessage(user.first_name) },
      ...sortedOrder.map(order => ({ text: `${orderMessage(order)}` }))
    )
  }

  return messages
}
