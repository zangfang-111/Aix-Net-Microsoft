import QuoteRequest from './model'

export default {
  async create (ctx) {
    const newQuoteRequest = new QuoteRequest({
      initiatingTrader: ctx.params.initiatingTraderId,
      financialInstrument: ctx.params.financialInstrumentId,
      quantity: ctx.params.quantity,
      quoteRequestId: ctx.params.quoteRequestId,
      status: ctx.params.status,
      createdQuoteRequestEvent: ctx.params.createdQuoteRequestEvent
    })

    const data = await newQuoteRequest.save()

    return data.view()
  },
  async find (ctx) {
    const data = await QuoteRequest.find({})
      .populate('initiatingTrader')
      .populate('financialInstrument')

    return data.map(item => item.view())
  },
  async findOne (ctx) {
    const data = await QuoteRequest.findOne(ctx.params).exec()

    if (data) {
      return data.view()
    }

    return null
  },
  async findById (ctx) {
    const data = await QuoteRequest.findById(ctx.params.id)

    if (data) {
      return data.view()
    }

    return null
  },
  async count (ctx) {
    const data = await QuoteRequest.countDocuments(ctx.params).exec()

    return data
  },
  async update (ctx) {
    const item = await QuoteRequest.findById(ctx.params.id).exec()
    if (!item) return null

    await QuoteRequest.update({ _id: { $in: ctx.params.id } }, ctx.params, { multi: true }).exec()
    return item.view()
  },
  async delete (ctx) {
    const quoteRequest = await QuoteRequest.findById(ctx.params.id)
    if (!quoteRequest) return false
    await quoteRequest.remove()
    return true
  }
}
