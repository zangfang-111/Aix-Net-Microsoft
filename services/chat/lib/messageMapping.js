import _ from 'lodash'
import botMessages from '../messages'

const messageMapping = {
  PRICE_OUTSIDE_SOFT_THRESHOLD: {
    scenario: 'confirm',
    topic: 'spread'
  },
  PRICE_OUTSIDE_HARD_THRESHOLD: {
    scenario: 'retype',
    topic: 'spread'
  },
  BID_PRICE_OUTSIDE_SOFT_THRESHOLD: {
    scenario: 'confirm',
    topic: 'bid',
    reason: 'too_high'
  },
  BID_PRICE_OUTSIDE_HARD_THRESHOLD: {
    scenario: 'retype',
    topic: 'bid',
    reason: 'too_high'
  },
  OFFER_PRICE_OUTSIDE_SOFT_THRESHOLD: {
    scenario: 'confirm',
    topic: 'offer',
    reason: 'too_high'
  },
  OFFER_PRICE_OUTSIDE_HARD_THRESHOLD: {
    scenario: 'retype',
    topic: 'offer',
    reason: 'too_high'
  }
}
export default messageMapping
export const mapExistingOrderToSREContext = async (senderId, error, sreContext, sessionSet) => {
  await sessionSet({ key: senderId + '_order_exists_id', value: error.data.id })
  await sessionSet({ key: senderId + '_order_exists_current_volume', value: error.data.quantity })
  return {
    scenario: 'merge',
    intent: sreContext.intent,
    security: sreContext.security,
    current_volume: error.data.quantity,
    volume_increment: sreContext.volume,
    side: sreContext.side,
    price: sreContext.price
  }
}

export const mapTwoWayOrderExistsWithBidAndOffer = async (senderId, sreContext, offerOrder, bidOrder, sessionSet) => {
  await sessionSet({ key: senderId + '_order_exists_current_offer_volume', value: offerOrder.quantity })
  await sessionSet({ key: senderId + '_order_exists_current_bid_volume', value: bidOrder.quantity })
  await sessionSet({ key: senderId + '_bid_order_exists_id', value: bidOrder.id })
  await sessionSet({ key: senderId + '_offer_order_exists_id', value: offerOrder.id })
  return {
    scenario: 'merge',
    intent: 'add_two_way_order',
    security: sreContext.security,
    current_bid_volume: bidOrder.quantity,
    current_offer_volume: offerOrder.quantity,
    volume_increment: sreContext.volume,
    bid: sreContext.bid,
    offer: sreContext.offer
  }
}

export const mapTwoWayOrderExistsWithBidOrder = async (senderId, sreContext, bidOrder, sessionSet) => {
  await sessionSet({ key: senderId + '_order_exists_current_bid_volume', value: bidOrder.quantity })
  await sessionSet({ key: senderId + '_bid_order_exists_id', value: bidOrder.id })
  return {
    scenario: 'merge',
    intent: 'add_two_way_order',
    topic: 'bid',
    security: sreContext.security,
    current_bid_volume: bidOrder.quantity,
    current_offer_volume: 0,
    volume_increment: sreContext.volume,
    bid: sreContext.bid,
    offer: sreContext.offer
  }
}

export const mapTwoWayOrderExistsWithOfferOrder = async (senderId, sreContext, offerOrder, sessionSet) => {
  await sessionSet({ key: senderId + '_order_exists_current_offer_volume', value: offerOrder.quantity })
  await sessionSet({ key: senderId + '_offer_order_exists_id', value: offerOrder.id })
  return {
    scenario: 'merge',
    intent: 'add_two_way_order',
    topic: 'offer',
    security: sreContext.security,
    current_bid_volume: 0,
    current_offer_volume: offerOrder.quantity,
    volume_increment: sreContext.volume,
    bid: sreContext.bid,
    offer: sreContext.offer
  }
}

export const mapTwoWayOrderExists = async (data, senderId, sreContext, sessionSet) => {
  const { bidOrder, offerOrder } = data
  if (bidOrder !== null && offerOrder !== null) {
    return mapTwoWayOrderExistsWithBidAndOffer(senderId, sreContext, offerOrder, bidOrder, sessionSet)
  }
  if (bidOrder !== null) {
    return mapTwoWayOrderExistsWithBidOrder(senderId, sreContext, bidOrder, sessionSet)
  }
  if (offerOrder !== null) {
    return mapTwoWayOrderExistsWithOfferOrder(senderId, sreContext, offerOrder, sessionSet)
  }
}

export const mapErrorMessageToSREContext = async (error, senderId, sreContext, sessionSet) => {
  if (_.has(messageMapping, error.message)) {
    return messageMapping[error.message]
  } else if (error.message === 'ORDER_EXISTS_ERROR') {
    return mapExistingOrderToSREContext(senderId, error, sreContext, sessionSet)
  } else if (error.message === 'TWO_WAY_ORDER_EXISTS_ERROR') {
    return mapTwoWayOrderExists(error.data, senderId, sreContext, sessionSet)
  }
  return null
}

export const extendSREContext = (toSREContext, sreContext, intent) => {
  const isUpdateOrAddTwoWayOrder = () => (intent === 'add_two_way_order' || intent === 'update_two_way_order')
  return {
    ...toSREContext,
    intent: intent,
    security: sreContext.security,
    volume: sreContext.volume,
    side: isUpdateOrAddTwoWayOrder() ? undefined : sreContext.side,
    price: isUpdateOrAddTwoWayOrder() ? undefined : sreContext.price,
    bid: isUpdateOrAddTwoWayOrder() ? sreContext.bid : undefined,
    offer: isUpdateOrAddTwoWayOrder() ? sreContext.offer : undefined
  }
}

export const mapQuoteSoftThreshold = (sreContext) => {
  return {
    scenario: 'confirm',
    topic: 'spread',
    reason: 'too_wide',
    intent: sreContext.intent,
    rfq_bid_price: sreContext.rfq_bid_price,
    rfq_offer_price: sreContext.rfq_offer_price,
    rfq_volume: sreContext.rfq_volume,
    rfq_id: sreContext.rfq_id,
    rfq_security: sreContext.rfq_security
  }
}

export const mapQuoteHardThreshold = (sreContext) => {
  return {
    scenario: 'retype',
    topic: 'spread',
    reason: 'too_wide',
    intent: sreContext.intent,
    rfq_bid_price: sreContext.rfq_bid_price,
    rfq_offer_price: sreContext.rfq_offer_price,
    rfq_volume: sreContext.rfq_volume,
    rfq_id: sreContext.rfq_id,
    rfq_security: sreContext.rfq_security
  }
}

export const defaultErrorMessage = (error) => {
  if (error.message === 'ORDER_EXISTS_ERROR') {
    return botMessages.orderExistsError(error.data)
  }
  return error.message
}
