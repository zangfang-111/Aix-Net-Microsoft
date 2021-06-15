import messages from '../messages'
import { formatPriceValue } from '../util/chat-helper'

const { generalError } = messages

/**
 * Handles "market_value" intent
 *
 * @param {String} sreAnswerText - Text received from SRE
 * @param {String} security - Security idenified by the SRE from user's input
 * @param {Object} trader - Trader object
 * @param {Object} broker - Molecular broker object
 * @return {Object} OutgoingMessage object to be sent to the user with the current Market Price for security
 */
export const handleViewCurrentMarketPrice = async (sreAnswerText, security, trader, broker) => {
  if (security === undefined || sreAnswerText === undefined || sreAnswerText.length === 0) {
    return generalError
  }

  const tradingInfo = await broker.call('price.getCurrentTradingInfo', {
    coin: security,
    currency: 'USD'
  })

  return {
    text: sreAnswerText.replace(`{price}`, `$${formatPriceValue(tradingInfo.PRICE, 2)}`)
  }
}
