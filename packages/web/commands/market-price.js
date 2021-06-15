import moment from 'moment'

export const marketPriceCommand = async (ctx, broker) => {
  const user = ctx.message.from
  console.log(ctx.message.from)

  await broker.call('session.clearUserSession', { userId: user.id })

  let coin = ctx.state.command.args[0].toUpperCase()

  let messages = []
  if (coin === 'BTC' || coin === 'ETH') {
    const tradingInfo = await broker.call('price.getCurrentTradingInfo', {
      coin: coin,
      currency: 'USD'
    })
    let btcMarketPrice = tradingInfo.PRICE

    const url = await broker.call('price.createInfoCard', {
      telegramId: user.id,
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

    let msg = `${coin} is trading at ${btcMarketPrice} USD`
    messages.push(
      { text: msg },
      { imageUrl: url })
  } else {
    let msg = `BTC or ETH is only available.`
    messages.push({
      text: msg
    })
  }

  return messages
}
