const { MoleculerError } = require('moleculer').Errors

export default class InvalidPriceError extends MoleculerError {
  constructor (msg) {
    super(msg || `INVALID_PRICE_ERROR`, 'INVALID_PRICE_ERROR')
  }
}
