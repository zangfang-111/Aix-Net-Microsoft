import https from 'https'
import axios from 'axios'
import quoteClientHelper from './quote-client-helper'
const debug = require('debug')('AiX:quote:quote-client-wrapper')
import _ from 'lodash'

let quoteClient = null
let axiosInterceptor = null

class QuoteClient {
  constructor (broker) {
    this.broker = broker
    let apiObject = {
      baseURL: process.env.AIX_QUOTE_SERVICE,
      timeout: 15000
    }

    if (quoteClient == null) {
      quoteClient = axios.create(apiObject)
    }

    if (!!axiosInterceptor || axiosInterceptor === 0) {
      quoteClient.interceptors.response.eject(axiosInterceptor)
    }

    quoteClient.interceptors.request.use(function (config) {
      debug('> Quote Service Request <')
      debug(config.method.toUpperCase() + ' ' + config.baseURL + config.url)
      debug(config.data)
      debug('> Quote Service Request <')

      return config
    })

    axiosInterceptor = quoteClient.interceptors.response.use(this.handleSuccess, this.handleError)

    this.quoateRequestStream = null
    this.quoateStream = null
  }

  handleSuccess (response) {
    debug('> Quote Service Response <')
    debug(response.status + ' ' + response.statusText)
    debug(response.data)
    debug('> Quote Service Response <')

    return response.data
  }

  handleError (error) {
    if (error.response === undefined) {
      throw new Error('Quote Service Error:\n' + error.message)
    }

    debug('> Quote Service Error Response <')
    debug(error.response.status + ' ' + error.response.statusText)
    debug(error.response.data)
    debug('> Quote Service Error Response <')

    throw new Error('Quote Service Error:\n' + error.response.status + ' ' + error.response.statusText + '\n' + error.response.data.message)
  }

  parseStreamData (streamRawData) {
    try {
      const eventData = JSON.parse(streamRawData.toString())
      return eventData
    } catch (error) {
      this.broker.logger.error(`< QuoteClient parseStreamData >`, error)
      return null
    }
  }

  monitorIncomingQuotes (traderId, streamUrl) {
    const onQuoteRequestStreamData = eventStream => {
      this.broker.logger.info(`< onQuoteRequestStreamData streaming > ${eventStream}`)
      const eventData = this.parseStreamData(eventStream)

      if (_.has(eventData, ['expiringQuoteRequestEvent', 'quoteRequest'])) {
        const {
          quoteRequest
        } = eventData.expiringQuoteRequestEvent
        this.broker.broadcast('quote.request.expiring', {
          traderId,
          quote: quoteRequest
        })
      } else if (_.has(eventData, ['expiredQuoteRequestEvent'])) {
        const {
          quoteRequest
        } = eventData.expiredQuoteRequestEvent

        this.broker.broadcast('quote.request.expired', { traderId, quoteRequest })
      }
    }
    const onQuoteRequestStreamEnd = () => {
      this.broker.logger.info(`< createQuoteRequest streaming > stream ended`)
    }

    const onQuoteStreamData = quoteStream => {
      this.broker.logger.info(`< onQuoteStreamData streaming > ${quoteStream}`)
      const incomingQuotes = this.parseStreamData(quoteStream)

      if (_.has(incomingQuotes, 'improvedQuoteEvent')) {
        this.broker.broadcast('quote.update.improved', {
          traderId,
          quote: _.get(incomingQuotes, 'improvedQuoteEvent.improvedQuote')
        })
      } else if (_.has(incomingQuotes, 'degradedQuoteEvent')) {
        this.broker.broadcast('quote.update.degraded', {
          traderId,
          quote: incomingQuotes.degradedQuoteEvent
        })
      } else {
        this.broker.logger.warn(`< onQuoteStreamData not handled > ${quoteStream}`)
      }
    }
    const onQuoteStreamEnd = () => {
      this.broker.logger.info(`< createQuote streaming > stream ended`)
    }

    try {
      streamUrl.forEach(url => {
        if (url.href.includes('/quote/request')) {
          this.quoateRequestStream = https.get(url.href, stream => {
            stream.on('data', onQuoteRequestStreamData)
            stream.on('end', onQuoteRequestStreamEnd)
          }).on('error', (e) => {
            this.broker.logger.error('QuoteRequestStream Error', e)
          })
        } else if (url.href.includes('/quote/')) {
          this.quoateStream = https.get(url.href, stream => {
            stream.on('data', onQuoteStreamData)
            stream.on('end', onQuoteStreamEnd)
          }).on('error', (e) => {
            this.broker.logger.error('QuoteStream Error', e)
          })
        }
      })
    } catch (e) {
      this.broker.logger.warn(`< createQuote streaming error > ${e.name}: ${e.message}`)
      this.broker.broadcast('quote.UpdateError', { traderId })
    }
  }

  async createQuote (quantity, symbol, trader) {
    try {
      let quote = await quoteClient.post('/request/create', {
        trader,
        symbol,
        quantity,
        expirationInSeconds: process.env.QUOTE_EXPIRATION_IN_SECONDS
      })
      this.monitorIncomingQuotes(trader, quote._links.GET)
      return quoteClientHelper.quoteView(quote.quoteRequest)
    } catch (e) {
      this.broker.logger.warn(`< createQuote > ${e.name}: ${e.message}`)
      throw e
    }
  }

  async cancelQuote (cancelId) {
    try {
      let res = await quoteClient.delete(`/request/cancel/${cancelId}`)
      return quoteClientHelper.quoteView(res.quoteRequest)
    } catch (e) {
      this.broker.logger.warn(`< cancelQuote > ${e.name}: ${e.message}`)
      throw e
    }
  }
}

export { QuoteClient }
