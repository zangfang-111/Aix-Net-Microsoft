import { formatPriceValue } from '../util/chat-helper'

/**
 * This script defines messages or functions that generate messages, to
 * be displayed into the user's chat.
 */

/**
 * Error Messages
 */
import notificationMessages from './notification-messages'

const generalErrorMessage = { text: `Oups. Something went wrong. Please try again` }

const orderExistsErrorMessage = (order) => {
  if (order.side === 'BUY') {
    return `Thank you, I'm already working a $${order.price} bid for you in ${order.quantity} ${order.security}. If you want to work something else let me know.`
  }

  if (order.side === 'SELL') {
    return `Thank you, I'm already working a $${order.price} offer for you in ${order.quantity} ${order.security}. If you want to work something else let me know.`
  }

  return generalErrorMessage
}

const noOrders = [
  username => `${username}, it seems you don't have any orders. If you want to work any just let me know by saying something like:`,
  `Please work a 7000 bid for 10 btc`,
  `offer 7500 for 20 eth`
]

const viewOrdersFirstMessage = name => `Hi ${name}! We are working on following:`

const format = {
  BUY: 'Bid',
  SELL: 'Offer'
}
const viewOrderMessage = order => order.side === 'BUY'
  ? `${format[order.side]} $${order.price} for ${order.quantity} ${order.security}`
  : `${format[order.side]} ${order.quantity} ${order.security} at $${order.price}`

const traderNotAuthorizedMessage = { text: `Thanks for your interest. It appears that you are not an existing client, please visit www.aixtrade.com` }

const sessionExpiredMessage = `Working nothing for now, please provide a new trade when you are ready. I'm here for you.`

const quoteEnd = 'Looks like you are busy, working nothing for now.'

const quoteUpdateError = `Sorry, sometimes it's hard to get incoming quotes. Please create new quote request again.`

const tightestPrice = (bid, offer) => `The tightest price we have is $${bid}/$${offer}. Still working for you`

const degradedQuoteMessage = (bid, offer) => `Interest has left, The tightest price we now have is $${bid}/$${offer}.`
const degradedBidQuoteMessage = (bid, offer) => `Off that bid, The tightest we now have is $${bid}/$${offer}.`
const degradedOfferQuoteMessage = (bid, offer) => `Off that offer, The tightest we now have is $${bid}/$${offer}.`
const degradedQuoteWithoutValidPriceMessage = `Off that price, working to get you a new quote.`

const allCancelled = 'All cancelled, working nothing for you.'

const cancelSideAndSecurity = (sideArg, security) => `All cancelled, not working any ${sideArg}s in ${security}. Continue to work the following:`

const cancelSide = (sideArg) => `All cancelled, not working any ${sideArg}s. Still working the following:`

const cancelSecurity = (security) => `All cancelled, working nothing for you in ${security}. Continue to work the following:`

const noRemainingOrders = `No other orders working for now.`
// View Executed Orders
const msgNoExecutedOrders = (security) => `You don't have any executed orders yet` + ((security !== null) ? ` in ${security}` : '')
const msgExecutedOrdersForBuy = (avgPrice, execVolume, security) => `So far you have paid $${formatPriceValue(avgPrice, 2)} for ${execVolume} ${security}.`
const msgExecutedOrdersForSell = (avgPrice, execVolume, security) => `So far you have sold ${execVolume} ${security} at $${formatPriceValue(avgPrice, 2)}.`
const msgExecutedOrders = (security, avgBuyPrice, buyExecVolume, avgSellPrice, sellExecVolume, netPositionVolume, netExecutedPrice) => {
  let dayAverageMessage = `So far you have paid $${formatPriceValue(avgBuyPrice, 2)} for ${buyExecVolume} ${security} ` +
    `and you have sold ${sellExecVolume} ${security} at $${formatPriceValue(avgSellPrice, 2)}`

  if (netPositionVolume > 0) {
    dayAverageMessage += `, which leaves you long ${netPositionVolume} ${security} from $${formatPriceValue(netExecutedPrice, 2)} on the day`
  } else if (netPositionVolume < 0) {
    dayAverageMessage += `, which leaves you short ${netPositionVolume} ${security} from $${formatPriceValue(netExecutedPrice, 2)} on the day`
  }

  return dayAverageMessage
}

const infoCardCaption = 'Source: CoinRoutes LLC'

export default {
  generalError: generalErrorMessage,
  orderExistsError: orderExistsErrorMessage,
  traderNotAuthorized: traderNotAuthorizedMessage,
  sessionExpired: sessionExpiredMessage,
  notificationMessages: notificationMessages,
  quoteEnd,
  quoteUpdateError,
  noOrders,
  viewOrdersFirstMessage,
  viewOrderMessage,
  tightestPrice,
  degradedQuoteMessage,
  degradedBidQuoteMessage,
  degradedOfferQuoteMessage,
  degradedQuoteWithoutValidPriceMessage,
  allOrdersCancelled: allCancelled,
  cancelSideAndSecurity,
  cancelSide,
  cancelSecurity,
  noRemainingOrders,
  infoCardCaption,
  // View Executed Orders
  msgNoExecutedOrders,
  msgExecutedOrdersForBuy,
  msgExecutedOrdersForSell,
  msgExecutedOrders
}
