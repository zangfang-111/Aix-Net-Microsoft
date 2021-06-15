import messages from './messages'
export const newCommand = async (ctx, broker) => {
  await broker.call('session.clearUserSession', { userId: ctx.message.from.id })
  return [{ text: messages.newSession }]
}
