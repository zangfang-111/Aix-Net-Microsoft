import {
  createAddBidQuoteRequest,
  createAddOfferQuoteRequest,
  createAdd2WayQuoteRequest
} from '../lib/requestFactory'

const createMobOrder = (context, trader, intent) => {
  let mobOrder
  switch (context.intent) {
    case 'rfq_reply_one_way': {
      context.opposing_side === 'offer'
        ? mobOrder = createAddBidQuoteRequest(context, Number(trader.telegramId), false)
        : mobOrder = createAddOfferQuoteRequest(context, Number(trader.telegramId), false)
      break
    }
    case 'rfq_reply_oppose_way': {
      context.opposing_side === 'offer'
        ? mobOrder = createAddOfferQuoteRequest(context, Number(trader.telegramId), false)
        : mobOrder = createAddBidQuoteRequest(context, Number(trader.telegramId), false)
      break
    }
    default: {
      mobOrder = createAdd2WayQuoteRequest(intent, context, Number(trader.telegramId), false)
      break
    }
  }
  return mobOrder
}

export default createMobOrder
