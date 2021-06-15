/**
 * Action that returns latest 3 quotes for a given trader
 *
 * @param {*} ctx
 * @param {*} ctx.params
 *  telegramId
 * @return {Array | null}
 */
const findLatestOpenQuotes = {
  params: {
    telegramId: { type: 'string', length: 9 }
  },
  async handler (ctx) {
    const { telegramId } = ctx.params

    let quotes = await ctx.service.mobClient.getOpenQuotesByTraderId(telegramId)
    quotes = quotes.slice(0, 3)

    return quotes.length > 0 ? quotes : null
  }
}

export default findLatestOpenQuotes
