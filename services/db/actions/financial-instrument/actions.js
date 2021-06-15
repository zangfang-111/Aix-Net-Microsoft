import FinancialInstrument from './model'

export default {
  async get (ctx) {
    const data = await FinancialInstrument.find(ctx.params).exec()

    return data.map(item => item.view())
  },

  findAll: {
    async handler (ctx) {
      const financialInstruments = await FinancialInstrument.find({})
      if (Object.keys(financialInstruments).length === 0) {
        return null
      }
      return financialInstruments
    }
  }

}
