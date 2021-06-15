import { createMsg, timeLeft } from '../../../services/chat/util/common'

/* eslint-disable */
const quote = (quoteRequest) => {
  const bid = quoteRequest.quotesUpdates[0].bid.price
  const offer = quoteRequest.quotesUpdates[0].offer.price
  let bidOrOffer = null
  let price
  bid && offer
    ? price = `${bid}/${offer}`
    : bid
      ? (price = `${bid}`, bidOrOffer = 'Bid')
      : offer
        ? (price = `${offer}`, bidOrOffer = 'Offer')
        : null

  return { price, bidOrOffer }
}

const generateRfqsList = async (limit, rfq, broker) => {
  let lines = `Quote Request • Quote • Time left \n`
  let i = limit - 1
  let newline = ''

  const quoteRequest = await broker.call('db.quoteRequest.findOne', {
    quoteRequestId: rfq[i].quoteRequestId
  })

  while (rfq[i] !== undefined) {
    newline = i ? '\n' : ''
    const quoteData = quote(quoteRequest)
    const line =
      quoteData.bidOrOffer
        ? `/${rfq[i].rfqId} ${quoteData.bidOrOffer} ${rfq[i].volume} ${rfq[i].financialInstrument.label}/USD • ${quoteData.price} • ${timeLeft(rfq[i].createdAt)}`
        : `/${rfq[i].rfqId} ${rfq[i].volume} ${rfq[i].financialInstrument.label}/USD • ${quoteData.price} • ${timeLeft(rfq[i].createdAt)}`
    lines = lines + line + newline
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
  buttons.push({
    label: 'Cancell all'
  })
  return buttons
}

export const activeRfqsCommand = async (ctx, broker) => {
  let count, message
  const rfqs = await broker.call('db.rfq.findActive', {
    id: ctx.message.from.id
  })

  rfqs
    ? count = Object.keys(rfqs).length
    : message = createMsg(`No active quotes at the moment`)

  if (message) return message

  count === 1
    ? message = createMsg(`Here is your only active quote:`)
    : message = createMsg(`Here are your active quotes:`)

  const buttons = setButtons(rfqs, count)
  const queryMsg = await generateRfqsList(count, rfqs, broker)
  const query = createMsg(queryMsg, null, buttons)

  return [message, query]
}
