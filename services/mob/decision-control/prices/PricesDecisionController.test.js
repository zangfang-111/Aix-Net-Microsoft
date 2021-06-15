const expect = require('chai').expect
import BidPriceOutsideSoftThresholdError from '../../errors/BidPriceOutsideSoftThresholdError'
import BidPriceOutsideHardThresholdError from '../../errors/BidPriceOutsideHardThresholdError'
import OfferPriceOutsideHardThresholdError from '../../errors/OfferPriceOutsideHardThresholdError'
import OfferPriceOutsideSoftThresholdError from '../../errors/OfferPriceOutsideSoftThresholdError'
import PriceOutsideSoftThresholdError from '../../errors/PriceOutsideSoftThresholdError'
import PriceOutsideHardThresholdError from '../../errors/PriceOutsideHardThresholdError'
import priceDecisionController from './PricesDecisionController'

const marketPrice = 7000
const financialInstrument = 'BTC'
var checkFn

describe('PricesDecisionController', () => {
  describe('instance', () => {
    it('should contain the needed constants', () => {
      expect(priceDecisionController).to.have.any.keys(
        'MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC',
        'MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC'
      )
      expect(priceDecisionController.MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC).to.be.a('number')
      expect(priceDecisionController.MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC).to.be.a('number')
    })
  })

  describe('checkIfValidBidPrice()', () => {
    beforeEach(() => {
      checkFn = priceDecisionController.checkIfValidBidPrice
    })

    it('should return correct decision for valid values', () => {
      let bidPice = 6900

      let resp
      expect(() => { resp = checkFn(bidPice, financialInstrument, marketPrice) }).to.not.throw()
      // eslint-disable-next-line
      expect(resp).to.be.true
    })

    it('should throw BidPriceOutsideSoftThresholdError', () => {
      let bidPice = 6825

      expect(() => checkFn(bidPice, financialInstrument, marketPrice)).to.throw(BidPriceOutsideSoftThresholdError)
    })

    it('should throw BidPriceOutsideHardThresholdError', () => {
      let bidPice = 5949

      expect(() => checkFn(bidPice, financialInstrument, marketPrice)).to.throw(BidPriceOutsideHardThresholdError)
    })
  })

  describe('checkIfValidOfferPrice()', () => {
    beforeEach(() => {
      checkFn = priceDecisionController.checkIfValidOfferPrice
    })

    it('should return correct decision for valid values', () => {
      let bidPice = 7175

      let resp
      expect(() => { resp = checkFn(bidPice, financialInstrument, marketPrice) }).to.not.throw()
      // eslint-disable-next-line
      expect(resp).to.be.true
    })

    it('should throw OfferPriceOutsideSoftThresholdError', () => {
      let offerPrice = 7176

      expect(() => checkFn(offerPrice, financialInstrument, marketPrice)).to.throw(OfferPriceOutsideSoftThresholdError)
    })

    it('should throw OfferPriceOutsideHardThresholdError', () => {
      let offerPrice = 8051

      expect(() => checkFn(offerPrice, financialInstrument, marketPrice)).to.throw(OfferPriceOutsideHardThresholdError)
    })
  })

  describe('checkIfValidBidPrice()', () => {
    beforeEach(() => {
      checkFn = priceDecisionController.checkIfValidBidPrice
    })

    it('should return correct decision for valid values', () => {
      let bidPice = 6900

      let resp
      expect(() => { resp = checkFn(bidPice, financialInstrument, marketPrice) }).to.not.throw()
      // eslint-disable-next-line
      expect(resp).to.be.true
    })

    it('should throw BidPriceOutsideSoftThresholdError', () => {
      let bidPice = 6825

      expect(() => checkFn(bidPice, financialInstrument, marketPrice)).to.throw(BidPriceOutsideSoftThresholdError)
    })

    it('should throw BidPriceOutsideHardThresholdError', () => {
      let bidPice = 5949

      expect(() => checkFn(bidPice, financialInstrument, marketPrice)).to.throw(BidPriceOutsideHardThresholdError)
    })
  })

  describe('checkIf2WayPriceIsValid()', () => {
    beforeEach(() => {
      checkFn = priceDecisionController.checkIf2WayPriceIsValid
    })

    it('BID & OFFER outside HARD Threshold - should throw PriceOutsideHardThresholdError', () => {
      let bidPrice = 5950
      let offerPrice = 8051

      expect(() => checkFn(bidPrice, offerPrice, financialInstrument, marketPrice)).to.throw(PriceOutsideHardThresholdError)
    })

    it('BID & OFFER outside SOFT Threshold - should throw PriceOutsideSoftThresholdError', () => {
      let bidPrice = 6825
      let offerPrice = 7176

      expect(() => checkFn(bidPrice, offerPrice, financialInstrument, marketPrice)).to.throw(PriceOutsideSoftThresholdError)
    })

    it('BID outside HARD Threshold | OFFER valid - should throw BidPriceOutsideHardThresholdError', () => {
      let bidPrice = 5950
      let offerPrice = 7100

      expect(() => checkFn(bidPrice, offerPrice, financialInstrument, marketPrice)).to.throw(BidPriceOutsideHardThresholdError)
    })

    it('BID outside HARD Threshold | OFFER outside SOFT - should throw BidPriceOutsideHardThresholdError', () => {
      let bidPrice = 5950
      let offerPrice = 7176

      expect(() => checkFn(bidPrice, offerPrice, financialInstrument, marketPrice)).to.throw(BidPriceOutsideHardThresholdError)
    })

    it('BID valid | OFFER outside HARD Threshold - should throw OfferPriceOutsideHardThresholdError', () => {
      let bidPrice = 6900
      let offerPrice = 8051

      expect(() => checkFn(bidPrice, offerPrice, financialInstrument, marketPrice)).to.throw(OfferPriceOutsideHardThresholdError)
    })

    it('BID outside SOFT Threshold | OFFER outside HARD Threshold - should throw OfferPriceOutsideHardThresholdError', () => {
      let bidPrice = 6825
      let offerPrice = 8051

      expect(() => checkFn(bidPrice, offerPrice, financialInstrument, marketPrice)).to.throw(OfferPriceOutsideHardThresholdError)
    })
  })
})
