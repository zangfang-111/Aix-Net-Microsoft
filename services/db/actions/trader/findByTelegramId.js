import Trader from './model'

export default async (ctx) => {
  const query = { telegramId: ctx.params.telegramId }
  return Trader.findOne(query).exec()
}
