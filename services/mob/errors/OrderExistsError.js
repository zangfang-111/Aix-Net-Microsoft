const { MoleculerError } = require('moleculer').Errors

export default class OrderExistsError extends MoleculerError {
  constructor (order) {
    super('ORDER_EXISTS_ERROR', 100, `ORDER_EXISTS_ERROR`, order)
  }
}
