import moment from 'moment'

const handleDisplayCard = async (text, answer, trader, ctx) => {
  const currency = 'USD'
  const security = answer.context.security
  const tradingInfo = await ctx.broker.call('price.getCurrentTradingInfo', {
    coin: security,
    currency
  })

  const url = await ctx.broker.call('price.createInfoCard', {
    telegramId: trader.telegramId,
    content: {
      coin: tradingInfo.FROMSYMBOL,
      currency: tradingInfo.TOSYMBOL,
      currentPrice: tradingInfo.PRICE,
      now: moment(tradingInfo.LASTUPDATE).format('HH:mm:ss'),
      currencySymbol: '$',
      dayLowPrice: tradingInfo.LOWDAY,
      dayHighPrice: tradingInfo.HIGHDAY
    }
  })

  return {
    text,
    imageUrl: url
  }
}

export default handleDisplayCard
