const { MoleculerClientError } = require('moleculer').Errors

export default {
  /**
* @apiName  POST dashboard-api/traders
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {Object} Trader object to be created
*
* @apiSuccess {Object} Created Trader
*
* @apiError 400 Failed to create new entity
* @apiError 400 TraderId already in use
* @apiError 401 Unauthorized
*/
  create: {
    params: {
      email: { type: 'email' },
      telegramId: { type: 'string', length: 9 },
      mobileNumber: { type: 'string' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      companyName: { type: 'string' },
      sessionId: { type: 'string' },
      financialInstrumentsInUse: { type: 'array' },
      traderType: { type: 'string' },
      bankDetails: { type: 'object' },
      wallet: { type: 'array' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const instruments = await ctx.broker.call('db.financialInstrument.get')
        ctx.params.financialInstrumentsInUse = instruments
        const trader = await ctx.broker.call('db.trader.create', ctx.params)
        if (!trader) {
          throw new MoleculerClientError(`Failed to create new entity`, 400)
        }
        return trader
      } catch (e) {
        if (e.code === 11000 && e.name === 'MongoError') {
          throw new MoleculerClientError('TraderId already in use', 400)
        }
        throw e
      }
    }
  },
  /**
* @apiName  GET dashboard-api/traders
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiSuccess {Array} Of Traders {Object}.
*
* @apiError 400 Failed to find any traders
* @apiError 401 Unauthorized
*/
  get: {
    async handler (ctx) {
      try {
        const trader = await ctx.broker.call('db.trader.find')
        if (!trader) {
          throw new MoleculerClientError(`Failed to find any traders`, 400)
        }
        return trader
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  GET dashboard-api/traders/:traderId
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {ObjectId} Wanted trader's ID
*
* @apiSuccess {Object} Found Trader
*
* @apiError 400 Failed to find the wanted trader
* @apiError 401 Unauthorized
*/
  getById: {
    params: {
      id: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const trader = await ctx.broker.call('db.trader.findById', ctx.params)
        if (!trader) {
          throw new MoleculerClientError(`Failed to find the wanted trader`, 400)
        }
        return trader
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  GET dashboard-api/traders/telegram/:id
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {String} Wanted trader's telegramId
*
* @apiSuccess {Object} Found Trader
*
* @apiError 400 Failed to find the wanted trader`
* @apiError 401 Unauthorized
*/
  getByTelegramId: {
    params: {
      id: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const trader = await ctx.broker.call('db.trader.findByTelegramId', ctx.params)
        if (!trader) {
          throw new MoleculerClientError(`Failed to find the wanted trader`, 400)
        }
        return trader
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  PUT dashboard-api/traders/:id
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {Object} Trader's properties to be updated
*
* @apiSuccess {Object} Updated Trader
*
* @apiError 400 Failed to update entity
* @apiError 401 Unauthorized
*/
  update: {
    params: {
      id: { type: 'string' },
      email: { type: 'email', optional: true },
      telegramId: { type: 'string', length: 9, optional: true },
      mobileNumber: { type: 'string', optional: true },
      firstName: { type: 'string', optional: true },
      lastName: { type: 'string', optional: true },
      companyName: { type: 'string', optional: true },
      sessionId: { type: 'string', optional: true },
      financialInstrumentsInUse: { type: 'array', optional: true },
      traderType: { type: 'string', optional: true },
      bankDetails: { type: 'object', optional: true },
      wallet: { type: 'array', optional: true }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const trader = await ctx.broker.call('db.trader.update', ctx.params)
        if (!trader) {
          throw new MoleculerClientError(`Failed to update entity`, 400)
        }
        return trader
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  DELETE dashboard-api/traders/:id
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {ObjectId} To be removed Trader's ID
*
* @apiSuccess 200 Trader with id: 123456789 has been removed
*
* @apiError 400 Trader with id: 123456789 does not exist
* @apiError 401 Unauthorized
*/
  delete: {
    params: {
      id: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const deleted = await ctx.broker.call('db.trader.delete', ctx.params)
        if (deleted === false) {
          throw new MoleculerClientError(`Trader with id: ${ctx.params.id} does not exist`, 400)
        }
        return `Trader with id: ${ctx.params.id} has been removed`
      } catch (e) {
        throw e
      }
    }
  }
}
