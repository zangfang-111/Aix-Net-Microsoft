import actions from './actions'
import priceDecisionController from './decision-control/prices/PricesDecisionController'

import { MobClient } from './mob-client/mob-client'
import StreamClient from './stream-client/stream-client'
import { STREAM_ENDPOINTS } from './stream-client/stream-endpoints'

const getMarketPrice = async (security, broker) => {
  const securityTradingInfo = await broker.call('price.getCurrentTradingInfo', {
    coin: security.toUpperCase(),
    currency: 'USD'
  })
  return securityTradingInfo.PRICE
}

module.exports = {
  name: 'mob',
  async started () {
  },
  created () {
    this.mobClient = new MobClient()
    this.streamClient = new StreamClient(STREAM_ENDPOINTS.ORDER, 'order', this.broker)
    this.streamClient.startStreaming()
  },
  hooks: {
    before: {
      'order.add': 'checkIfPriceIsValid',
      'order.add2Way': 'checkIf2WayPriceIsValid',
      'quote.add': 'checkIfPriceIsValid',
      'quote.add2Way': 'checkIf2WayPriceIsValid'
    }
  },
  methods: {
    /**
     * Function used to check an order's price is valid according to SOFT & HARD thresholds.
     * If price is not valid the function will throw Price related erros.
     * @param {*} ctx
     */
    async checkIfPriceIsValid (ctx) {
      if (ctx.params.noThresholdCheck) {
        return true
      }

      const marketPrice = await getMarketPrice(ctx.params.security, ctx.broker)

      ctx.broker.logger.info(`> ${ctx.params.security}/USD current market price: ${marketPrice}`)

      if (ctx.params.side === 'BUY') {
        priceDecisionController.checkIfValidBidPrice(
          ctx.params.price,
          ctx.params.security,
          marketPrice,
          ctx.params.confirmedSoftThreshold)
      } else {
        priceDecisionController.checkIfValidOfferPrice(
          ctx.params.price,
          ctx.params.security,
          marketPrice,
          ctx.params.confirmedSoftThreshold)
      }
    },
    /**
     * Function used to check an 2 way order's price is valid according to SOFT & HARD thresholds.
     * If price is not valid the function will throw Price related erros.
     * @param {*} ctx
     */
    async checkIf2WayPriceIsValid (ctx) {
      const marketPrice = await getMarketPrice(ctx.params.security, ctx.broker)

      ctx.broker.logger.info(`> ${ctx.params.security}/USD current market price: ${marketPrice}`)

      priceDecisionController.checkIf2WayPriceIsValid(
        ctx.params.bidPrice,
        ctx.params.offerPrice,
        ctx.params.security,
        marketPrice,
        ctx.params.confirmedSoftThreshold)
    }
  },
  actions: {
    ...actions
  }
}
