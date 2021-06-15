export const getAllOrdersByTelegramId = async (ctx) => {
  const { telegramId } = ctx.params

  const orders = await ctx.service.mobClient.getAllOrdersByTraderId(telegramId)

  ctx.broker.logger.info(orders)

  return orders
}
