import Order from './model'
import _ from 'lodash'

export default {
  async create (ctx) {
    const newOrder = new Order({
      orderId: ctx.params.orderId,
      combinedId: ctx.params.combinedId,
      telegramId: ctx.params.telegramId,
      financialInstrumentLabel: ctx.params.financialInstrumentLabel,
      orderStatus: ctx.params.orderStatus,
      executedStatus: ctx.params.executedStatus,
      orderType: ctx.params.orderType,
      side: ctx.params.side,
      price: ctx.params.price,
      quantity: ctx.params.quantity,
      executedQuantity: ctx.params.executedQuantity,
      initialQuantity: ctx.params.quantity
    })

    const data = await newOrder.save()

    return data.view()
  },
  async find (ctx) {
    const data = await Order.find(ctx.params).exec()

    return data.map(item => item.view())
  },
  async findOne (ctx) {
    const data = await Order.findOne(ctx.params).exec()

    if (data) {
      return data.view()
    }

    return null
  },
  async count (ctx) {
    const data = await Order.countDocuments(ctx.params).exec()

    return data
  },
  async update (ctx) {
    const item = await Order.findById(ctx.params.id).exec()

    if (item) {
      const availablePropertiesToUpdate = ['quantity']

      availablePropertiesToUpdate.filter(property => property in ctx.params).forEach(property => {
        item[property] = ctx.params[property]
      })

      const data = await item.save()

      return data.view()
    }

    return null
  },

  /**
   * Action that updates database and create meaning orders
   *
   * @param {*} ctx
   * @param {*} ctx.params
   *  orders
   */
  executed: {
    params: {
      orders: { type: 'array' }
    },
    async handler (ctx) {
      let orders = ctx.params.orders

      /** PHASE - 1
        * grouping orders by order id and sort orders to update database
        */
      let groupedOrders = _.groupBy(orders, order => order.id)
      let sortedOrders = []

      for (let orderId in groupedOrders) {
        let trader = groupedOrders[orderId][0]['trader']
        let side = groupedOrders[orderId][0]['side']
        let price = groupedOrders[orderId][0]['price']
        let symbol = groupedOrders[orderId][0]['symbol']
        let totalExecutedQty = groupedOrders[orderId].reduce((totalQty, order) => totalQty + order['executionQuantity'], 0)

        sortedOrders.push({
          orderId,
          trader,
          side,
          price,
          symbol,
          executionQuantity: totalExecutedQty
        })
      }

      /** PHASE - 2
        * update database & sort orders by one-way order and two-way order
        */
      for (let order of sortedOrders) {
        let orderInDB = await Order.findOne({ orderId: order['orderId'] }).exec()
        let combinedOrderInDb = await Order.findOne({ combinedId: order['orderId'] })

        if (orderInDB) {
          orderInDB['orderStatus'] = 'Executed'
          let totalExecutedQuantity = orderInDB['executedQuantity'] + order['executionQuantity']
          orderInDB['executedQuantity'] = totalExecutedQuantity
          if (orderInDB['initialQuantity'] > totalExecutedQuantity) {
            orderInDB['executedStatus'] = 'PARTIAL'
          } else {
            orderInDB['executedStatus'] = 'FILL'
          }
          order['selfExecutedStatus'] = orderInDB['executedStatus']
          order['originalQuantity'] = orderInDB['initialQuantity']
          order['orderStatus'] = 'Executed'
          order['orderType'] = orderInDB['orderType']

          if (orderInDB['orderType'] === 'TWO') {
            order['combinedId'] = orderInDB['combinedId']
            order['combinedExecutedStatus'] = combinedOrderInDb['executedStatus'] ? combinedOrderInDb['executedStatus'] : 'PARTIAL'
            order['combinedOrderStatus'] = combinedOrderInDb['orderStatus']
            order['combinedExecutedPrice'] = combinedOrderInDb['price']
            order['combinedExecutedVolume'] = combinedOrderInDb['executedQuantity']
            order['combinedOriginalQuantity'] = combinedOrderInDb['initialQuantity']
          }
          await orderInDB.save()
        }
      }

      sortedOrders.forEach((order, index) => {
        if (order.orderType === 'TWO') {
          sortedOrders.map((odr, idx) => {
            if (order.combinedId === odr.orderId) {
              order['combinedIndex'] = idx
            }
          })
        }
      })

      return sortedOrders
    }
  }
}
