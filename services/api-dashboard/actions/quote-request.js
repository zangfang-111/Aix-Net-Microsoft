const { MoleculerClientError } = require('moleculer').Errors

export default {
/**
* @apiName  GET dashboard-api/quote-requests
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiSuccess {Array} Of Price Requests {Object}.
*
* @apiError 400 Failed to find any quote requests
* @apiError 401 Unauthorized
*/
  get: {
    async handler (ctx) {
      try {
        const quoteRequests = await ctx.broker.call('db.quoteRequest.find')
        if (!quoteRequests) {
          throw new MoleculerClientError(`Failed to find any quote requests`, 400)
        }
        return quoteRequests
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  GET dashboard-api/quote-requests/:id
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {ObjectId} Wanted quote request's ID
*
* @apiSuccess {Object} Found Price Request
*
* @apiError 400 Failed to find the wanted quote request
* @apiError 401 Unauthorized
*/
  getById: {
    params: {
      id: { type: 'string' }
    },
    async handler (ctx) {
      try {
        const quoteRequests = await ctx.broker.call('db.quoteRequest.findById', ctx.params)
        if (!quoteRequests) {
          throw new MoleculerClientError(`Failed to find the requested quote request`, 400)
        }
        return quoteRequests
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  DELETE dashboard-api/quote-requests/:id
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {ObjectId} To be removed Quote Request's ID
*
* @apiSuccess 200 Quote Request with id: 123456789 has been removed
*
* @apiError 400 Quote Request with id: 123456789 does not exist
* @apiError 401 Unauthorized
*/
  delete: {
    params: {
      id: { type: 'string' }
    },
    async handler (ctx) {
      try {
        const deleted = await ctx.broker.call('db.quoteRequest.delete', ctx.params)
        if (deleted === false) {
          throw new MoleculerClientError(`Quote Request with id: ${ctx.params.id} does not exist`, 400)
        }
        return `Quote request with id: ${ctx.params.id} has been removed`
      } catch (e) {
        throw e
      }
    }
  }
}
