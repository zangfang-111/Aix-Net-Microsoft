
export const createAdd2WayOrderRequest = (intentName, sreContext, senderId) => ({
  confirmedSoftThreshold: (intentName === 'update_two_way_order'),
  security: sreContext.security,
  volume: sreContext.volume,
  bidPrice: sreContext.bid,
  offerPrice: sreContext.offer,
  telegramId: senderId
})

export const createAddOfferOrderRequest = (sreContext, senderId) => ({
  security: sreContext.security,
  volume: sreContext.offer_volume,
  side: 'SELL',
  price: sreContext.offer,
  telegramId: senderId,
  confirmedSoftThreshold: true
})

export const createAddBidOrderRequest = (sreContext, senderId) => ({
  security: sreContext.security,
  volume: sreContext.bid_volume,
  side: 'BUY',
  price: sreContext.bid,
  telegramId: senderId,
  confirmedSoftThreshold: true
})

export const createAdd2WayQuoteRequest = (intentName, sreContext, senderId, confirmedSoftThreshold = true) => ({
  confirmedSoftThreshold: confirmedSoftThreshold,
  security: sreContext.rfq_security,
  volume: sreContext.rfq_volume,
  bidPrice: sreContext.rfq_bid_price,
  offerPrice: sreContext.rfq_offer_price,
  telegramId: senderId
})

export const createAddBidQuoteRequest = (sreContext, senderId, confirmedSoftThreshold = true) => ({
  confirmedSoftThreshold: confirmedSoftThreshold,
  security: sreContext.security || sreContext.rfq_security,
  volume: sreContext.volume || sreContext.rfq_volume,
  side: 'BUY',
  price: sreContext.price,
  telegramId: senderId
})

export const createAddOfferQuoteRequest = (sreContext, senderId, confirmedSoftThreshold = true) => ({
  confirmedSoftThreshold: confirmedSoftThreshold,
  security: sreContext.security || sreContext.rfq_security,
  volume: sreContext.volume || sreContext.rfq_volume,
  side: 'SELL',
  price: sreContext.price,
  telegramId: senderId
})
