import messages from './messages'
const price = messages.price

export const getPriceCommand = async (ctx, broker) => {
  const traderId = ctx.message.from.id
  const command = ctx.message.text.split(' ')
  if (command.length < 3) {
    return [{ text: price.missing }]
  }
  const res = await broker.call('quote.create', {
    traderId,
    security: command[1],
    volume: command[2]
  })

  if (res) {
    return [{ text: price.created(res) }]
  }

  return [{ text: price.error }]
}
