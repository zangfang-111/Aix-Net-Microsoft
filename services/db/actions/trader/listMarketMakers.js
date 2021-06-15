import Trader from './model'

export default async (ctx) => {
  const query = { traderType: 'MM' }
  return Trader.find(query).exec()
}
