const { MoleculerError } = require('moleculer').Errors

export default class BidPriceOutsideSoftThresholdError extends MoleculerError {
  constructor () {
    super(`BID_PRICE_OUTSIDE_SOFT_THRESHOLD`)
  }
}
