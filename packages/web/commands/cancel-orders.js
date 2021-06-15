import messages from './messages'
import { sortOrders } from '../util'

const { orderMessage, generalErrorMessage } = messages

const getOpenOrders = async (telegramId, broker) => {
  const orders = await broker.call('mob.order.findOpenOrders', { telegramId })
  let messages = []

  if (orders.length === 0) {
    messages.push({ text: `No other orders working for now.` })
  } else {
    const sortedOrder = sortOrders(orders)
    messages.push(
      ...sortedOrder.map(order => ({ text: `${orderMessage(order)}` }))
    )
  }

  return messages
}

export const cancelOrdersCommand = async (ctx, broker) => {
  const user = ctx.message.from
  let messages = []
  let message
  let noOfCanceledOrders = 0

  try {
    if (ctx.state.command.args.length === 1) {
      let arg = ctx.state.command.args[0].toUpperCase()

      if (arg === 'BIDS' || arg === 'OFFERS') {
        let side = (arg === 'BIDS') ? 'BUY' : null
        side = (arg === 'OFFERS') ? 'SELL' : null

        noOfCanceledOrders = await broker.call('mob.order.cancel.all', { side, traderTelegramId: user.id })
        if (noOfCanceledOrders > 0) {
          message = `All cancelled, not working any ${arg}. Still working the following`
        }
      } else if (arg === 'ETHUSD' || arg === 'BTCUSD') {
        noOfCanceledOrders = await broker.call('mob.order.cancel.all', { security: arg, traderTelegramId: user.id })
        if (noOfCanceledOrders > 0) {
          message = `All cancelled, working nothing for you in ${arg}. Continue to work the following:`
        }
      } else if (arg === 'ALL') {
        noOfCanceledOrders = await broker.call('mob.order.cancel.all', { traderTelegramId: user.id })
        if (noOfCanceledOrders > 0) {
          message = `All cancelled, working nothing for you.`
        }
      }
    } else if (ctx.state.command.args.length === 2) {
      const security = ctx.state.command.args[0].toUpperCase()
      const sideArg = ctx.state.command.args[1].toUpperCase()

      if (security !== 'ETHUSD' && security !== 'BTCUSD') {
        return [{ text: `I'm not really sure what you want me to do.` }]
      }

      if (sideArg !== 'BIDS' && sideArg !== 'OFFERS') {
        return [{ text: `I'm not really sure what you want me to do.` }]
      }

      let side = (sideArg === 'BIDS') ? 'BUY' : null
      side = (sideArg === 'OFFERS') ? 'SELL' : null

      let noOfCanceledOrders = await broker.call('mob.order.cancel.all', { security, side, traderTelegramId: user.id })

      if (noOfCanceledOrders > 0) {
        message = `All cancelled, not working any ${sideArg} in ${security}. Continue to work the following:`
      }
    } else {
      let msg = `I'm not really sure what you want me to do.`
      messages.push({
        text: msg
      })
      return messages
    }

    let openOrders
    if (noOfCanceledOrders === 0) {
      message = `Sorry, nothing to cancel for that.`
    } else {
      openOrders = await getOpenOrders(user.id, broker)
    }

    messages.push({ text: message })
    if (openOrders) {
      messages = messages.concat(openOrders)
    }
    return messages
  } catch (error) {
    messages = []
    messages.push({
      text: generalErrorMessage
    })
    messages.push({
      text: error.message
    })
    return messages
  }
}
