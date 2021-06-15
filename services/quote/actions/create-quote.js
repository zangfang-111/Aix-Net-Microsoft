/**
 * Action used to start a Quote Request.
 * @param {*} ctx Molecular context. ctx.params need to contain the following:
 * - security
 * - volume - The size of the underlying security
 * - traderId - The trader's telegramId
 * - silent - Boolean. If set to true the quote created even will not be triggered.
 */
export default {
  params: {
    volume: { type: 'number', positive: true, min: 0, max: 99999999 },
    security: { type: 'string', length: 6 },
    traderId: { type: 'string', length: 9 }
  },
  async handler (ctx) {
    const {
      volume,
      security,
      traderId
    } = ctx.params

    try {
      let quote = await ctx.service.quoteClient.createQuote(volume, security, traderId)

      ctx.broker.logger.info(quote)
      return quote
    } catch (error) {
      throw error
    }
  }
}
