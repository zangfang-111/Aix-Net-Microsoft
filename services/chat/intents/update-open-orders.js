import _ from 'lodash'
// import messages from '../messages'
// eslint-disable-next-line
const debug = require('debug')('AiX:chat:intents:view-executed-orders')
import {
  defaultErrorMessage
} from '../lib/messageMapping'

/**
 * Handles "update_open_order" intent
 *
 * @param {Object} trader - Trader object
 * @param {Object} broker - Molecular broker object
 * @return {Array} Array of OutgoingMessage objects to be sent to the user
 */
export const handleUpdateOpenOrders = async (trader, sreAnswer, broker) => {
  const security = _.get(sreAnswer, 'context.security', null)
  const price = _.get(sreAnswer, 'context.price', null)
  const sreSide = _.get(sreAnswer, 'context.side', null)
  const newPrice = _.get(sreAnswer, 'context.new_price', null)
  const newVolume = _.get(sreAnswer, 'context.new_volume', null)

  let side = (sreSide !== null && sreSide.toLowerCase() === 'bid') ? 'BUY' : null
  side = (sreSide !== null && sreSide.toLowerCase() === 'offer') ? 'SELL' : side

  const searchPayload = { telegramId: trader.telegramId }
  if (security) {
    searchPayload.security = security
  }
  if (side) {
    searchPayload.side = side
  }
  if (price) {
    searchPayload.price = price
  }
  const orders = await broker.call('mob.order.findOpenOrders', searchPayload)

  let messages = []
  if (orders.length === 1 && !_.isNil(orders[0])) {
    const updatePayload = { id: orders[0].id }
    const messageContextParams = {
      security: orders[0].security.replace('USD', ''),
      volume: orders[0].quantity
    }
    if (newPrice) {
      updatePayload.price = newPrice
      messageContextParams.new_price = newPrice
    } else {
      updatePayload.price = orders[0].price
      messageContextParams.price = orders[0].price
    }
    if (newVolume) {
      updatePayload.volume = newVolume
      messageContextParams.new_volume = newVolume
    } else {
      updatePayload.volume = orders[0].quantity
      messageContextParams.volume = orders[0].quantity
    }
    try {
      await broker.call('mob.order.update', updatePayload)
    } catch (error) {
      return { text: defaultErrorMessage(error) }
    }

    messages.push({
      text: sreAnswer.output.text[0],
      contextParams: messageContextParams
    })
    return messages
  }

  if (orders.length === 0) {
    messages.push({ text: `Hmm...it seems you don't have a matching ${sreSide}` + ((security) ? ` order for ${security}` : ``) })
  } else if (orders.length > 0) {
    messages.push({ text: `It seems I'm working multiple ` + ((security) ? `${security} ` : ``) + `${sreSide}s for you. Please be more specific` })
  }
  return messages
}
