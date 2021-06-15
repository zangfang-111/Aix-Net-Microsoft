const { MoleculerError } = require('moleculer').Errors

export default class TwoWayOrderExistsError extends MoleculerError {
  constructor (bidOrder, offerOrder) {
    super('TWO_WAY_ORDER_EXISTS_ERROR', 100, `TWO_WAY_ORDER_EXISTS_ERROR`, { bidOrder, offerOrder })
  }
}
