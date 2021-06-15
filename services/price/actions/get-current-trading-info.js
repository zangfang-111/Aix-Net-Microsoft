import _ from 'lodash'
import aixMarketDataClient from '../lib/aixMarketDataClient'

/**
 * Action used to get current trading Info.
 * @param {*} ctx
 * @param {*} ctx.params
 * - coin
 * - currency
 */

export default {
  params: {
    coin: { type: 'string', min: 3 },
    currency: { type: 'string', min: 3 }
  },
  async handler (ctx) {
    const coin = ctx.params.coin.toUpperCase()
    const currency = _.get(ctx.params, 'currency', 'USD').toUpperCase()

    if (Date.now() > (this.cacheTradingInfo[coin][currency].responseAt + (10 * 1000))) {
      const aixMarketResponse = await aixMarketDataClient.getCurrentTradingInfo(
        [coin], [currency]
      )

      const rawPricesInfo = {
        PRICE: aixMarketResponse.marketData.price.price,
        FROMSYMBOL: aixMarketResponse.fromSymbol[0],
        TOSYMBOL: aixMarketResponse.marketData.price.currency,
        LOWDAY: aixMarketResponse.marketData.tradingData.lowDay,
        HIGHDAY: aixMarketResponse.marketData.tradingData.highDay
      }

      this.cacheTradingInfo[coin][currency].response = rawPricesInfo
      this.cacheTradingInfo[coin][currency].responseAt = Date.now()
    }

    return this.cacheTradingInfo[coin][currency].response
  }
}
