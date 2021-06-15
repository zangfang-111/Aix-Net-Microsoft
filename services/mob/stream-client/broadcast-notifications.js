const sendOrderNotification = (orders, serviceBroker) => {
  serviceBroker.broadcast('order.executed', orders)
}

export default {
  order: sendOrderNotification
}
