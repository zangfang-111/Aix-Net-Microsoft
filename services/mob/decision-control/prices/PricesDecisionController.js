import BidPriceOutsideHardThresholdError from '../../errors/BidPriceOutsideHardThresholdError'
import BidPriceOutsideSoftThresholdError from '../../errors/BidPriceOutsideSoftThresholdError'
import OfferPriceOutsideHardThresholdError from '../../errors/OfferPriceOutsideHardThresholdError'
import OfferPriceOutsideSoftThresholdError from '../../errors/OfferPriceOutsideSoftThresholdError'
import PriceOutsideSoftThresholdError from '../../errors/PriceOutsideSoftThresholdError'
import PriceOutsideHardThresholdError from '../../errors/PriceOutsideHardThresholdError'
import InvalidPriceError from '../../errors/InvalidPriceError'
import DecisionController from '../DecisionController'

class PricesDecisionController extends DecisionController {
  constructor () {
    super()

    this.checkIf2WayPriceIsValid = this.checkIf2WayPriceIsValid.bind(this)
    this.checkIfValidBidPrice = this.checkIfValidBidPrice.bind(this)
    this.checkIfValidOfferPrice = this.checkIfValidOfferPrice.bind(this)
  }

  checkIfValidBidPrice (bidPrice, financialInstrument, marketPrice, confirmedSoftThreshold = false) {
    if (marketPrice === undefined || marketPrice === 0) {
      throw new Error('Market Price not available')
    }

    if (typeof bidPrice !== 'number') {
      throw new InvalidPriceError('Bid price is not a valid number')
    }

    let bidDeviation = Math.abs(1 - bidPrice / marketPrice)

    console.log('bidDeviation: ' + bidDeviation)

    if (bidDeviation > this.MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC) {
      throw new BidPriceOutsideHardThresholdError()
    }

    if (!confirmedSoftThreshold && bidDeviation > this.MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC) {
      throw new BidPriceOutsideSoftThresholdError()
    }

    return true
  }

  checkIfValidOfferPrice (offerPrice, financialInstrument, marketPrice, confirmedSoftThreshold = false) {
    if (marketPrice === undefined || marketPrice === 0) {
      throw new Error('Market Price not available')
    }

    if (typeof offerPrice !== 'number') {
      throw new InvalidPriceError('Offer price is not a valid number')
    }

    let offerDeviation = Math.abs(1 - offerPrice / marketPrice)

    console.log('offerDeviation:' + offerDeviation)

    if (offerDeviation > this.MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC) {
      throw new OfferPriceOutsideHardThresholdError()
    }

    if (!confirmedSoftThreshold && offerDeviation > this.MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC) {
      throw new OfferPriceOutsideSoftThresholdError()
    }

    return true
  }

  checkIf2WayPriceIsValid (bidPrice, offerPrice, financialInstrument, marketPrice, confirmedSoftThreshold = false) {
    let validBidPrice
    try {
      validBidPrice = this.checkIfValidBidPrice(bidPrice, financialInstrument, marketPrice, confirmedSoftThreshold)
    } catch (error) {
      validBidPrice = error
    }

    let validOfferPrice
    try {
      validOfferPrice = this.checkIfValidOfferPrice(offerPrice, financialInstrument, marketPrice, confirmedSoftThreshold)
    } catch (error) {
      validOfferPrice = error
    }

    if (validBidPrice === true && validOfferPrice === true) {
      return true
    } else if (validBidPrice instanceof BidPriceOutsideHardThresholdError &&
      validOfferPrice instanceof OfferPriceOutsideHardThresholdError) {
      throw new PriceOutsideHardThresholdError()
    } else if (validBidPrice instanceof BidPriceOutsideSoftThresholdError &&
      validOfferPrice instanceof OfferPriceOutsideSoftThresholdError) {
      throw new PriceOutsideSoftThresholdError()
    } else if (validBidPrice instanceof BidPriceOutsideHardThresholdError) {
      throw validBidPrice
    } else if (validOfferPrice instanceof OfferPriceOutsideHardThresholdError) {
      throw validOfferPrice
    } else if (validBidPrice instanceof BidPriceOutsideSoftThresholdError) {
      throw validBidPrice
    } else if (validOfferPrice instanceof OfferPriceOutsideSoftThresholdError) {
      throw validOfferPrice
    }
  }
}

export default new PricesDecisionController()
