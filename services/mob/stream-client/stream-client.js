import https from 'https'
import broadcastNotifications from './broadcast-notifications'
const debug = require('debug')('AiX:mob:stream-client')

let serviceBroker = null
export default class StreamClient {
  constructor (endpoint, notificationName, broker) {
    this.streamEndpoint = `${process.env.AIX_ORDERBOOK_SERVICE}/streams/${endpoint}`
    this.notificationName = notificationName
    serviceBroker = broker

    this.startStreaming = this.startStreaming.bind(this)
    this.onStreamData = this.onStreamData.bind(this)
    this.onStreamEnd = this.onStreamEnd.bind(this)
    this.processOrders = this.processOrders.bind(this)
  }

  onStreamData (streamData) {
    const streamDataString = streamData.toString()
    try {
      if (streamDataString.includes('heartbeat')) {
        debug('heartbeat')
      } else if (streamDataString.includes('order')) {
        let orders = streamDataString.split(`{"order":`)
        orders.splice(0, 1)
        orders = orders.map(order => `{"order":${order}`)
        this.processOrders(orders, 'Executed')
      }
    } catch (error) {
      serviceBroker.logger.error('<order book stream endpoint error>', error)
      serviceBroker.logger.error(streamData)
    }
  }

  onStreamEnd () {
    debug('MOB Stream End')
    debug('Try to restart streaming')
    this.startStreaming()
  }

  startStreaming () {
    debug('MOB Stream Start: ', this.streamEndpoint)

    try {
      let req = https.get(this.streamEndpoint, (stream) => {
        stream.on('data', this.onStreamData)
        stream.on('end', this.onStreamEnd)

        stream.on('timeout', () => {
          debug('MOB Stream Timeout')
        })
        stream.on('aborted', () => {
          debug('MOB Stream aborted')
        })
        stream.on('close', () => {
          debug('MOB Stream close')
        })
      })

      req.on('error', (e) => {
        serviceBroker.logger.error('MOB Stream Error', e.message)
        this.startStreaming()
      })

      req.end()
    } catch (error) {
      debug('MOB Stream Error', error)
      this.startStreaming()
      throw new Error(error.response.status + ' ' + error.response.statusText)
    }
  }

  processOrders (orders, status) {
    let executedOrders = []
    orders.map(order => {
      if (order.orderStatus === 'Executed') {
        executedOrders.push(order)
      }
    })
    orders = executedOrders.map(order => JSON.parse(order)['order'])
    if (orders.length > 1) {
      broadcastNotifications[this.notificationName](orders, serviceBroker)
    }
  }
}
