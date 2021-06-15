import Rfq from './model'
import FinancialInstrument from '../financial-instrument/model'

export default {
  async create (ctx) {
    const newRfq = {
      quoteRequestId: ctx.params.quoteRequestId,
      marketMakerTelegramId: ctx.params.marketMakerTelegramId,
      volume: ctx.params.volume
    }

    if (ctx.params.security) {
      newRfq.financialInstrument = await FinancialInstrument.findOne({ label: ctx.params.security }).exec()
    }

    const data = await Rfq.create(newRfq)

    return data.view()
  },
  async find (ctx) {
    let filter = ctx.params

    if (ctx.params.security) {
      const financialInstrument = await FinancialInstrument.findOne({ label: ctx.params.security }).exec()
      delete filter.security
      filter['financialInstrument'] = financialInstrument._id
    }

    let data = await Rfq.find(filter).populate('financialInstrument')

    return data.map(item => item.view())
  },
  async findWithLimit (ctx) {
    const data = await Rfq.find({
      marketMakerTelegramId: { $eq: ctx.params.id },
      status: 'OPEN'
    }).sort({ createdAt: -1 }).limit(ctx.params.limit).populate('financialInstrument')
    if (data[0] === undefined) return null

    return data.map(item => item.view())
  },
  async findActive (ctx) {
    const data = await Rfq.find({
      marketMakerTelegramId: { $eq: ctx.params.id },
      status: ['ACTIVE']
    }).sort({ createdAt: -1 }).populate('financialInstrument')
    if (data[0] === undefined) return null
    return data.map(item => item.view())
  },
  async count (ctx) {
    const count = await Rfq.countDocuments(ctx.params)
    return count
  },
  async findAndUpdate (ctx) {
    const findData = await Rfq.find(ctx.params.find).populate('financialInstrument')

    const ids = []
    findData.forEach(rfq => {
      ids.push(rfq.id)
    })

    await Rfq.update({ _id: { $in: ids } }, ctx.params.update, { multi: true }).exec()

    return findData.map(item => item.view())
  },
  async findOne (ctx) {
    const data = await Rfq.findOne(ctx.params).populate('financialInstrument')

    if (data) {
      return data.view()
    }

    return null
  }
}
