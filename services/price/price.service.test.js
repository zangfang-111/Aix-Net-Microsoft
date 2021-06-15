import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('Price Service', () => {
  // runs before all tests in this block
  // eslint-disable-next-line
  beforeAll(async function () {
    process.env.AWS_S3_ACCESS_KEY = 'AKIAJ4IR3N7YXZG2QG6Q'
    process.env.AWS_S3_SECRET_ACCESS_KEY = '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'
    process.env.AWS_S3_BUCKET_NAME = 'aix-dev-v1'
    await broker.loadService(`./services/price/price.service.js`)
    await broker.start()
  })

  // eslint-disable-next-line
  afterAll(function () {
    broker.stop()
  })

  describe('getCurrentTradingInfo()', () => {
    let priceResult

    beforeEach(async () => {
      priceResult = await broker.call('price.getCurrentTradingInfo', {
        coin: 'BTC',
        currency: 'USD'
      })
    })

    it('should work as expected for BTC', async () => {
      let priceConfirm = await broker.call('price.getCurrentTradingInfo', {
        coin: 'BTC',
        currency: 'USD'
      })

      expect(typeof priceConfirm).to.equal('object')
      expect(priceConfirm.PRICE).to.equal(priceResult.PRICE)
      expect(priceConfirm.LOWDAY).to.equal(priceResult.LOWDAY)
      expect(priceConfirm.HIGHDAY).to.equal(priceResult.HIGHDAY)
      expect(priceConfirm.FROMSYMBOL).to.equal(priceResult.FROMSYMBOL)
      expect(priceConfirm.TOSYMBOL).to.equal(priceResult.TOSYMBOL)
    })
  })

  describe('createInfoCard()', () => {
    it('should work as expected for ETH', function (done) {
      broker.call('price.createInfoCard', {
        content: {
          coin: 'ETH',
          currency: 'USD',
          currentPrice: 175.31,
          now: '20:23:44',
          currencySymbol: '$',
          dayLowPrice: 172.6,
          dayHighPrice: 208.15
        }
      })
        .then(urlResult => {
          expect(typeof urlResult).to.equal('string')
          done()
        })
    })
  })
})
