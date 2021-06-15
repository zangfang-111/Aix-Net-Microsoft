const { MoleculerError } = require('moleculer').Errors

export default class OfferPriceOutsideHardThresholdError extends MoleculerError {
  constructor () {
    super(`OFFER_PRICE_OUTSIDE_HARD_THRESHOLD`)
  }
}
