export const cancelAllOrders = async (ctx) => {
  const { security, side, traderTelegramId } = ctx.params

  try {
    const getOpenOrdersRespons = await ctx.service.mobClient.getOpenOrdersByTraderId(traderTelegramId, security, side)

    if (getOpenOrdersRespons.length === 0) {
      return 0
    }

    for (let i = 0; i < getOpenOrdersRespons.length; i++) {
      await ctx.service.mobClient.cancelOrder(getOpenOrdersRespons[i].id)
    }

    return getOpenOrdersRespons.length
  } catch (error) {
    throw error
  }
}
