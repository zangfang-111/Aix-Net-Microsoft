import Trader from './model'
import { USER_TYPES } from '../../constants'

export default async (ctx) => {
  const query = {
    traderType: USER_TYPES.MARKET_MAKER
  }

  return Trader.find(query).exec()
}
