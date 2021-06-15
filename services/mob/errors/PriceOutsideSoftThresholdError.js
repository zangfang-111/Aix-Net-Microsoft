const { MoleculerError } = require('moleculer').Errors

export default class BidPriceOutsideSoftThresholdError extends MoleculerError {
  constructor () {
    super(`PRICE_OUTSIDE_SOFT_THRESHOLD`)
  }
}
