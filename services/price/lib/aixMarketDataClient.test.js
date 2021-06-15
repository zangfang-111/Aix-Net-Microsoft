import { expect } from 'chai'
import aixMarketDataClient from './aixMarketDataClient'

describe('AiX Market Data Client', () => {
  it('should call and collect the right data from the api [BTC, USD]', async () => {
    const response = await aixMarketDataClient.getCurrentTradingInfo(
      ['BTC'], ['USD']
    )
    expect(response.marketData.price.price).to.be.a('number')
    expect(response.fromSymbol[0]).to.equal('BTC')
    expect(response.marketData.price.currency).to.equal('USD')
    expect(response.marketData.tradingData.lowDay).to.be.a('number')
    expect(response.marketData.tradingData.highDay).to.be.a('number')
  })
  it('should call and collect the right data from the api [ETH, USD]', async () => {
    const response = await aixMarketDataClient.getCurrentTradingInfo(
      ['ETH'], ['USD']
    )
    expect(response.marketData.price.price).to.be.a('number')
    expect(response.fromSymbol[0]).to.equal('ETH')
    expect(response.marketData.price.currency).to.equal('USD')
    expect(response.marketData.tradingData.lowDay).to.be.a('number')
    expect(response.marketData.tradingData.highDay).to.be.a('number')
  })
  it('should call and collect the right data from the api [XRP, USD]', async () => {
    const response = await aixMarketDataClient.getCurrentTradingInfo(
      ['XRP'], ['USD']
    )
    expect(response.marketData.price.price).to.be.a('number')
    expect(response.fromSymbol[0]).to.equal('XRP')
    expect(response.marketData.price.currency).to.equal('USD')
    expect(response.marketData.tradingData.lowDay).to.be.a('number')
    expect(response.marketData.tradingData.highDay).to.be.a('number')
  })
  it('should call and collect the right data from the api [LTC, USD]', async () => {
    const response = await aixMarketDataClient.getCurrentTradingInfo(
      ['LTC'], ['USD']
    )
    expect(response.marketData.price.price).to.be.a('number')
    expect(response.fromSymbol[0]).to.equal('LTC')
    expect(response.marketData.price.currency).to.equal('USD')
    expect(response.marketData.tradingData.lowDay).to.be.a('number')
    expect(response.marketData.tradingData.highDay).to.be.a('number')
  })
})
