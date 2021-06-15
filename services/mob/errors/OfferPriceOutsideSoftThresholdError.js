const { MoleculerError } = require('moleculer').Errors

export default class OfferPriceOutsideSoftThresholdError extends MoleculerError {
  constructor () {
    super(`OFFER_PRICE_OUTSIDE_SOFT_THRESHOLD`)
  }
}
