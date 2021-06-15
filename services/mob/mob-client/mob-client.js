import axios from 'axios'
import _ from 'lodash'
import { ORDERS_STATUSES, EXPIRE_IN_MILLIS, EXPIRE_IN_MILLIS_QUOTE } from '../constants'
import mobClientHelper from './mob-client-helper'
const debug = require('debug')('AiX:mob:fin-client-wrapper')

const MOB_SERVICE_URL = process.env.AIX_ORDERBOOK_SERVICE
var mobClient
let axiosInterceptor = null

/**
 * FIN Client that communicates with the FIN Wrapper around the FI MOB.
 * @type {Class}
 */
class MobClient {
  constructor () {
    let apiObject = {
      baseURL: MOB_SERVICE_URL,
      timeout: 15000
    }

    if (mobClient == null) {
      mobClient = axios.create(apiObject)
    }

    // remove interceptor if exists so that we don't add it multiple times
    // I found axiosInterceptor starts with 0, then +1.
    // Found this issue while working on unit tests when the same intercepter was added multiple times
    if (!!axiosInterceptor || axiosInterceptor === 0) {
      mobClient.interceptors.response.eject(axiosInterceptor)
    }

    mobClient.interceptors.request.use(function (config) {
      debug('> Order Book Service Request <')
      debug(config.method.toUpperCase() + ' ' + config.baseURL + config.url)
      debug(config.data)
      debug('> Order Book Service Request <')

      return config
    })

    axiosInterceptor = mobClient.interceptors.response.use(this.handleSuccess, this.handleError)
  }

  handleSuccess (response) {
    debug('> Order Book Service Response <')
    debug(response.status + ' ' + response.statusText)
    debug(response.data)
    debug('> Order Book Service Response <')

    return response.data
  }

  handleError (error) {
    if (error.response === undefined) {
      throw new Error('FIN Wrapper Error:\n' + error.message)
    }

    debug('> Order Book Service Error Response <')
    debug(error.response.status + ' ' + error.response.statusText)
    debug(error.response.data)
    debug('> Order Book Service Error Response <')

    throw new Error('FIN Wrapper Error:\n' + error.response.status + ' ' + error.response.statusText + '\n' + error.response.data.message)
  }

  getSecurity (security) {
    if (process.env.MOB_USE_ORDER_PREFIX === 'true') {
      return process.env.NODE_ENV.toUpperCase() + '_' + security
    }
    return security
  }

  /**
   * Creates a new order in the FIN MOB.
   * @param  {Object} params An object containing the details necessary to create
   * a limit order: side, quantity, security, price and traderTelegramId
   * @return {Object} Returns the order object received from the FIN MOB.
   */
  async createOrder (params) {
    const isQuote = _.get(params, 'isQuote', false)
    try {
      let order = await mobClient.post('/orders', {
        'expireInMillis': EXPIRE_IN_MILLIS,
        isQuote,
        'price': params.price,
        'quantity': params.quantity,
        'security': this.getSecurity(params.security),
        'side': params.side,
        'timeInForce': 'GTT',
        'trader': params.traderTelegramId
      })

      return mobClientHelper.orderView(order.order)
    } catch (error) {
      throw error
    }
  }

  async searchAndUpdateOrder (params, newPrice, newVolume) {
    const isQuote = _.get(params, 'isQuote', false)
    try {
      let order = await mobClient.put('/orders', {
        'replaceOrderRequest': {
          'price': newPrice,
          'quantity': newVolume
        },
        'searchOrderRequest': {
          'currentDay': true,
          isQuote,
          'orderStatuses': params.orderStatuses,
          'price': params.price,
          'quantity': params.quantity,
          'security': this.getSecurity(params.security),
          'side': params.side,
          'trader': params.traderTelegramId
        }
      })
      return mobClientHelper.orderView(order.order)
    } catch (error) {
      throw error
    }
  }

  async updateOrderPriceAndVolume (orderId, newPrice, newQuantity = null) {
    const updatePayload = {}
    if (newPrice) {
      updatePayload.price = newPrice
    }
    if (newQuantity) {
      updatePayload.quantity = newQuantity
    }
    try {
      const order = await mobClient.put('/orders/' + orderId, updatePayload)
      return mobClientHelper.orderView(order.order)
    } catch (error) {
      throw error
    }
  }

  async cancelOrder (orderId) {
    try {
      await mobClient.delete('/orders/' + orderId)
      return true
    } catch (error) {
      throw error
    }
  }

  async checkOrderExists (security, side, price, traderTelegramId) {
    try {
      let ordersResponse = await mobClient.post('/orders/search', {
        'orderStatuses': [ORDERS_STATUSES.OPEN],
        'security': this.getSecurity(security),
        'isQuote': false,
        'side': side,
        'price': price,
        'trader': traderTelegramId
      })
      let orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
      return (orders.length > 0) ? orders[0] : false
    } catch (error) {
      throw error
    }
  }

  async getAllOrdersByTraderId (traderTelegramId) {
    try {
      let allOrders = []
      let ordersResponse = await mobClient.post('/orders/search', {
        'orderStatuses': [
          ORDERS_STATUSES.OPEN,
          ORDERS_STATUSES.EXECUTED,
          ORDERS_STATUSES.CANCELED
        ],
        'isQuote': false,
        'trader': traderTelegramId
      })
      let orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
      let pageInfo = ordersResponse.page
      allOrders = allOrders.concat(orders)

      let pageNumber = 1
      while (orders.length === pageInfo.size) {
        let ordersResponse = await mobClient.post('/orders/search?page=' + pageNumber, {
          'orderStatuses': [
            ORDERS_STATUSES.OPEN,
            ORDERS_STATUSES.EXECUTED,
            ORDERS_STATUSES.CANCELED
          ],
          'trader': traderTelegramId
        })
        orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
        allOrders = allOrders.concat(orders)
        pageNumber++
      }
      return allOrders
    } catch (error) {
      throw error
    }
  }

  async getOpenOrdersByTraderId (traderTelegramId, security = null, side = null, price = null) {
    try {
      let allOrders = []
      const requestData = {
        'orderStatuses': [ORDERS_STATUSES.OPEN],
        'isQuote': false,
        'trader': traderTelegramId
      }
      if (security !== undefined && security !== null) {
        requestData.security = this.getSecurity(security)
      }
      if (side !== undefined && side !== null) {
        requestData.side = side
      }
      if (price !== undefined && price !== null) {
        requestData.price = price
      }
      let ordersResponse = await mobClient.post('/orders/search', requestData)
      let orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
      let pageInfo = ordersResponse.page
      allOrders = allOrders.concat(orders)

      let pageNumber = 1
      while (orders.length === pageInfo.size) {
        let ordersResponse = await mobClient.post('/orders/search?page=' + pageNumber, {
          'orderStatuses': [ORDERS_STATUSES.OPEN],
          'trader': traderTelegramId
        })
        orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
        allOrders = allOrders.concat(orders)
        pageNumber++
      }
      return allOrders
    } catch (error) {
      throw error
    }
  }

  async getExecutedOrdersByTraderId (traderTelegramId, security = null, currentDay = false) {
    const searchOptions = {
      currentDay,
      'orderStatuses': [ORDERS_STATUSES.EXECUTED],
      'isQuote': false,
      'trader': traderTelegramId
    }
    if (!_.isNil(security)) {
      searchOptions.security = security
    }
    try {
      let ordersResponse = await mobClient.post('/orders/search', searchOptions)
      let orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
      return orders
    } catch (error) {
      throw error
    }
  }

  async getBestOrder (security, side, quantity) {
    try {
      return await mobClient.get(`/orders/${security}/${side}/${quantity}`)
    } catch (error) {
      throw error
    }
  }

  async getOpenQuotesByTraderId (traderTelegramId) {
    try {
      let allQuotes = []
      const requestData = {
        'orderStatuses': [ORDERS_STATUSES.OPEN],
        'isQuote': true,
        'trader': traderTelegramId
      }

      let quotesResponse = await mobClient.post('/orders/search', requestData)
      let quotes = quotesResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
      let pageInfo = quotesResponse.page
      allQuotes = allQuotes.concat(quotes)

      let pageNumber = 1
      while (quotes.length === pageInfo.size) {
        quotesResponse = await mobClient.post('/orders/search?page=' + pageNumber, {
          'orderStatuses': [ORDERS_STATUSES.OPEN],
          'isQuote': true,
          'trader': traderTelegramId
        })
        quotes = quotesResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
        allQuotes = allQuotes.concat(quotes)
        pageNumber++
      }
      return allQuotes
    } catch (error) {
      throw error
    }
  }

  async checkQuoteExists (security, side, traderTelegramId) {
    try {
      let ordersResponse = await mobClient.post('/orders/search', {
        'orderStatuses': [ORDERS_STATUSES.OPEN],
        'security': this.getSecurity(security),
        'isQuote': true,
        'side': side,
        'trader': traderTelegramId
      })
      let orders = ordersResponse._embedded.orders.map(order => { return mobClientHelper.orderView(order.order) })
      return (orders.length > 0) ? orders[0] : false
    } catch (error) {
      throw error
    }
  }

  async createQuote (params) {
    try {
      let quote = await mobClient.post('/orders', {
        'expireInMillis': EXPIRE_IN_MILLIS_QUOTE,
        'isQuote': true,
        'price': params.price,
        'quantity': params.quantity,
        'security': this.getSecurity(params.security),
        'side': params.side,
        'timeInForce': 'GTT',
        'trader': params.traderTelegramId
      })

      return mobClientHelper.orderView(quote.order)
    } catch (error) {
      throw error
    }
  }
}

export {
  MobClient,
  MOB_SERVICE_URL
}
