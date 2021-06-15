export const bugCommand = async (ctx, broker) => {
  ctx.brokersreSessionId = await broker.call('session.get', { key: `${ctx.message.from.id}_SRE_SESSION_ID` })
  await broker.call('db.bug.create', ctx)
  ctx.reply('The bug was saved. Thank you.')
}
