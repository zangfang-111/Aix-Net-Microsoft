/**
 * Action used to cancel a Quote Request.
 * @param {*} ctx Molecular context. ctx.params need to contain the following:
 * - id
 */
export default {
  params: {
    id: { type: 'number' }
  },
  async handler (ctx) {
    try {
      const res = await ctx.service.quoteClient.cancelQuote(ctx.params.id)
      ctx.broker.broadcast('quote.request.canceled', res)
      return res.quoteRequestId
    } catch (error) {
      throw error
    }
  }
}
