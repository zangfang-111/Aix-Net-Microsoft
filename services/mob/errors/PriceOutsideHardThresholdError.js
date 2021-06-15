const { MoleculerError } = require('moleculer').Errors

export default class BidPriceOutsideHardThresholdError extends MoleculerError {
  constructor () {
    super(`PRICE_OUTSIDE_HARD_THRESHOLD`)
  }
}
