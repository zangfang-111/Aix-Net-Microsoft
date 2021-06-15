import botMessages from '../../messages'
import { TWOWAY_ORDER } from '../../util/constants'

async function orderExecuted (orders, broker) {
  let ordersForNotification = []
  orders[0].price = orders[1].price
  broker.call('db.order.executed', { orders }).then(sortedOrders => {
    sortedOrders.length > 0 && sortedOrders.forEach((order, index) => {
      if (order.orderType === 'ONE') {
        order.executionType = TWOWAY_ORDER.ONE
        ordersForNotification.push(order)
      } else {
        if (order.combinedIndex) {
          if (order.combinedIndex > index) {
            order.combinedExecutedStatus = sortedOrders[order.combinedIndex].selfExecutedStatus
            order.combinedExecutedPrice = sortedOrders[order.combinedIndex].price
            order.combinedExecutedVolume = sortedOrders[order.combinedIndex].executionQuantity
            order.combinedOriginalQuantity = sortedOrders[order.combinedIndex].originalQuantity
            order.combinedOrderStatus = sortedOrders[order.combinedIndex].orderStatus
            order.executionType = TWOWAY_ORDER.TWO_PARTIAL
            delete order.combinedIndex
            ordersForNotification.push(order)
          }
        } else {
          order.executionType = TWOWAY_ORDER.TWO_FILL
          ordersForNotification.push(order)
        }
      }
    })
    broker.logger.info('db.order.executed STATUS: ', ordersForNotification)
    if (ordersForNotification.length > 0) {
      let messages = botMessages.notificationMessages.orderExecuted(ordersForNotification)
      broker.logger.info('Send notification: ', messages)
      broker.call('web.pushBatch', messages)
    }
  }).catch(error => {
    broker.logger.error(error)
    throw error
  })

  return ordersForNotification
}

export default orderExecuted
