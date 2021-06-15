import _ from 'lodash'
import messages from '../messages'
// eslint-disable-next-line
const debug = require('debug')('AiX:chat:intents:view-executed-orders')

const {
  msgNoExecutedOrders,
  msgExecutedOrdersForBuy,
  msgExecutedOrdersForSell,
  msgExecutedOrders
} = messages

export const calculateDayAverage = (buyExecutedQuantity, buyTotalExecutedPrice, sellExecutedQuantity, sellTotalExecutedPrice) => {
  const avgBuyPrice = buyTotalExecutedPrice / buyExecutedQuantity
  const avgSellPrice = sellTotalExecutedPrice / sellExecutedQuantity
  return {
    avgBuyPrice,
    avgSellPrice,
    netPositionVolume: buyExecutedQuantity - sellExecutedQuantity,
    netExecutedPrice: (((buyExecutedQuantity * avgBuyPrice) - (sellExecutedQuantity * avgSellPrice)) / (buyExecutedQuantity - sellExecutedQuantity))
  }
}

export const calculateDayTotal = (orders) => {
  const dayTotalBySecurity = {}
  orders.map(order => {
    if (_.isNil(dayTotalBySecurity[order.security])) {
      dayTotalBySecurity[order.security] = {}
      dayTotalBySecurity[order.security].buyExecutedQuantity = 0
      dayTotalBySecurity[order.security].buyTotalExecutedPrice = 0
      dayTotalBySecurity[order.security].sellExecutedQuantity = 0
      dayTotalBySecurity[order.security].sellTotalExecutedPrice = 0
    }
    const securityTotal = dayTotalBySecurity[order.security]
    if (order.side === 'BUY') {
      securityTotal.buyExecutedQuantity = securityTotal.buyExecutedQuantity + order.execQty
      securityTotal.buyTotalExecutedPrice = securityTotal.buyTotalExecutedPrice + (order.execQty * order.price)
    }

    if (order.side === 'SELL') {
      securityTotal.sellExecutedQuantity = securityTotal.sellExecutedQuantity + order.execQty
      securityTotal.sellTotalExecutedPrice = securityTotal.sellTotalExecutedPrice + (order.execQty * order.price)
    }
  })

  return dayTotalBySecurity
}
/**
 * Handles "executed_orders" intent
 *
 * @param {Object} trader - Trader object
 * @param {Object} broker - Molecular broker object
 * @return {Array} Array of OutgoingMessage objects to be sent to the user
 */
export const handleViewExecutedOrders = async (trader, sreAnswer, broker) => {
  const security = _.get(sreAnswer, 'context.security', null)

  const orders = await broker.call('mob.order.findCurrentDayExecutedOrders', { telegramId: trader.telegramId, security })
  let messages = []

  if (orders.length === 0) {
    messages.push({ text: msgNoExecutedOrders(security) })
  } else {
    const dayTotal = calculateDayTotal(orders)
    Object.keys(dayTotal).map(security => {
      const cryptoTotal = dayTotal[security]
      if (cryptoTotal.buyExecutedQuantity > 0 && cryptoTotal.sellExecutedQuantity > 0) {
        const dayAverage = calculateDayAverage(cryptoTotal.buyExecutedQuantity, cryptoTotal.buyTotalExecutedPrice, cryptoTotal.sellExecutedQuantity, cryptoTotal.sellTotalExecutedPrice)
        messages.push({
          text: msgExecutedOrders(security, dayAverage.avgBuyPrice, cryptoTotal.buyExecutedQuantity, dayAverage.avgSellPrice, cryptoTotal.sellExecutedQuantity, dayAverage.netPositionVolume, dayAverage.netExecutedPrice)
        })
      } else if (cryptoTotal.buyExecutedQuantity > 0) {
        const avgPrice = cryptoTotal.buyTotalExecutedPrice / cryptoTotal.buyExecutedQuantity
        messages.push({
          text: msgExecutedOrdersForBuy(avgPrice, cryptoTotal.buyExecutedQuantity, security)
        })
      } else if (cryptoTotal.sellExecutedQuantity > 0) {
        const avgPrice = cryptoTotal.sellTotalExecutedPrice / cryptoTotal.sellExecutedQuantity
        messages.push({
          text: msgExecutedOrdersForSell(avgPrice, cryptoTotal.sellExecutedQuantity, security)
        })
      }
    })
  }

  return messages
}
