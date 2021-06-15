import _ from 'lodash'
import { MARKET_INSTRUMENTS } from './../constants'

export const getOpenOrdersByTelegramId = async (ctx) => {
  const { telegramId } = ctx.params
  let security = _.get(ctx, 'params.security', null)
  const side = _.get(ctx, 'params.side', null)
  let price = _.get(ctx, 'params.price', null)

  security = (security !== null) ? MARKET_INSTRUMENTS[security] : null
  price = (price !== null) ? price : null

  const orders = await ctx.service.mobClient.getOpenOrdersByTraderId(telegramId, security, side, price)

  ctx.broker.logger.info('getOpenOrdersByTelegramId')
  ctx.broker.logger.info(orders)

  return orders
}

export const getExecutedOrdersByTelegramId = async (ctx) => {
  const { telegramId } = ctx.params

  const orders = await ctx.service.mobClient.getExecutedOrdersByTraderId(telegramId)

  ctx.broker.logger.info('getExecutedOrdersByTelegramId')
  ctx.broker.logger.info(orders)

  return orders
}

export const getCurrentDayExecutedOrders = async (ctx) => {
  const { telegramId } = ctx.params
  let security = _.get(ctx, 'params.security', null)
  if (security !== null) {
    security = MARKET_INSTRUMENTS[security]
  }

  const orders = await ctx.service.mobClient.getExecutedOrdersByTraderId(telegramId, security, true)

  ctx.broker.logger.info('getCurrentDayExecutedOrders')
  ctx.broker.logger.info(orders)

  return orders
}
