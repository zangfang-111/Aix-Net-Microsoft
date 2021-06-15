export const updateOrder = async (ctx) => {
  const { id, volume, price } = ctx.params

  try {
    let order = await ctx.service.mobClient.updateOrderPriceAndVolume(id, price, volume)

    ctx.broker.logger.info('> Update Order <')
    ctx.broker.logger.info(order)
    return order.id
  } catch (error) {
    throw error
  }
}
