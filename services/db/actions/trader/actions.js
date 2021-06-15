import Trader from './model'

export default {
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
        const trader = await Trader.create(ctx.params)
        return trader.view()
      } catch (e) {
        throw e
      }
    }
  },
  findAll: {
    async handler (ctx) {
      const traders = await Trader.find({})
      if (Object.keys(traders).length === 0) {
        return null
      }
      return traders
    }
  },
  findByTraderId: {
    params: {
      id: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const trader = await Trader.findById(ctx.params.id)
        if (!trader) return null
        return trader.view()
      } catch (e) {
        throw e
      }
    }
  },
  findByTelegramId: {
    params: {
      id: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const query = { telegramId: ctx.params.id }
        const trader = Trader.findOne(query).exec()
        if (!trader) return null
        return trader.view()
      } catch (e) {
        throw e
      }
    }
  },
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
        const trader = await Trader.findById(ctx.params.id)
        if (!trader) return null

        await Trader.update({ _id: { $in: ctx.params.id } }, ctx.params, { multi: true }).exec()
        return trader.view()
      } catch (e) {
        throw e
      }
    }
  },
  delete: {
    params: {
      id: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const trader = await Trader.findById(ctx.params.id)
        if (!trader) return false
        await trader.remove()
        return true
      } catch (e) {
        throw e
      }
    }
  }
}
