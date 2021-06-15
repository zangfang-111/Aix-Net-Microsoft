import Trader from './model'

export default async (ctx) => {
  return Trader.find({}).exec()
}
