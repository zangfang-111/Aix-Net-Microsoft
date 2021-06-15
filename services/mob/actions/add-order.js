import { MARKET_INSTRUMENTS } from './../constants'
import OrderExistsError from '../errors/OrderExistsError'

export const addOrder = async (ctx) => {
  const { security, side, volume, price, telegramId } = ctx.params
  const orderDetails = {
    side: side,
    quantity: volume,
    security: MARKET_INSTRUMENTS[security],
    price: price,
    traderTelegramId: telegramId
  }

  try {
    let orderExists = await ctx.service.mobClient.checkOrderExists(MARKET_INSTRUMENTS[security], side, price, telegramId)

    if (orderExists) {
      ctx.broker.logger.warn(`Order Exists:`)
      ctx.broker.logger.warn(orderExists)
      throw new OrderExistsError(orderExists)
    }

    let order = await ctx.service.mobClient.createOrder(orderDetails)

    ctx.broker.logger.info(order)
    return order
  } catch (error) {
    throw error
  }
}
