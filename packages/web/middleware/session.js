/**
 * Sets "session" data to be used by chat.incoming service:
 * trader - info about the current trader
 * sreSessionId - State Rule Engine session id
 */
export default {
  localAction (next, action) {
    return async function (ctx) {
      if (action.name === 'chat.incoming') {
        const trader = await ctx.broker.call('db.trader.show', {
          telegramId: ctx.params.senderId
        })
        const sreSessionId = await ctx.broker.call('session.get', { key: `${ctx.params.senderId}_SRE_SESSION_ID` })
        ctx.session = {
          user: trader,
          sreSessionId
        }
      }
      return next(ctx)
        .then(res => {
          // Do something with the response
          return res
        })
        .catch(err => {
          // Handle error or throw further
          throw err
        })
    }
  }
}
