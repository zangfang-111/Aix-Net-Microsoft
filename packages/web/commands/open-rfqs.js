import { createMsg, timeLeft } from '../../../services/chat/util/common'

const generateRfqsList = (limit, rfq) => {
  let lines = `Quote Request • Time left \n`
  let i = limit - 1
  let newline = ''
  while (rfq[i] !== undefined) {
    newline = i ? '\n' : ''
    lines = lines + `/${rfq[i].rfqId} ${rfq[i].volume} ${rfq[i].financialInstrument.label}/USD • ${timeLeft(rfq[i].createdAt)}` + newline
    i--
  }
  return lines
}

const setButtons = (rfqs) => {
  let buttons = []
  for (let i in rfqs) {
    buttons.push({
      label: `/${rfqs[i].rfqId}`
    })
  }
  return buttons
}

export const openRfqsCommand = async (ctx, broker) => {
  let count, message
  const rfqs = await broker.call('db.rfq.findWithLimit', {
    id: ctx.message.from.id,
    limit: 5
  })

  rfqs
    ? count = Object.keys(rfqs).length
    : message = createMsg(`No open quotes at the moment`)

  if (message) return message

  count === 1
    ? message = createMsg(`Here is the last quote:`)
    : message = createMsg(`Here are the last ${count} quotes:`)

  const buttons = setButtons(rfqs, count)
  const query = createMsg(generateRfqsList(count, rfqs), null, buttons)

  return [message, query]
}
