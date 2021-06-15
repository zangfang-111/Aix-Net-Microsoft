const { MoleculerClientError } = require('moleculer').Errors

export default {

  /**
* @apiName  GET dashboard-api/financial-instruments
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiSuccess {Array} Of Financial Instruments {Object}.
*
* @apiError 400 Failed to find any financial instruments
* @apiError 401 Unauthorized
*/
  get: {
    async handler (ctx) {
      try {
        const financialInstrument = await ctx.broker.call('db.financialInstrument.find')
        if (!financialInstrument) {
          throw new MoleculerClientError(`Failed to find any financial instruments`, 400)
        }
        return financialInstrument
      } catch (e) {
        throw e
      }
    }
  }
}
