import Trader from './model'

export default async (ctx) => {
  const query = { telegramId: ctx.params.traderId }
  return Trader.findOne(query, { __v: 0, bankDetails: 0 }).exec()
}
