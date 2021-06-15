import _ from 'lodash'

export const processOutgoing = (messages, sreContextParams) => {
  const regex = /\{(.*?)\}/g
  const outputMessages = []

  if (!sreContextParams) {
    return messages
  }

  messages.forEach(msg => {
    if (msg.text) {
      var result = msg.text.replace(regex, function (match, token) {
        // Also check if the message has any specific params set; This params overwrite the general sreContextParams
        if (msg.contextParams !== undefined && msg.contextParams[token] !== undefined) {
          return msg.contextParams[token]
        }
        if (sreContextParams[token] === undefined) {
          return `{${token}}`
        }
        if (token === 'security' && sreContextParams[token] !== undefined) {
          return `${sreContextParams[token]}/USD`
        }
        if (token === 'price' && sreContextParams[token] !== undefined) {
          return `$${sreContextParams[token]}`
        }
        return sreContextParams[token]
      })
      outputMessages.push({
        ...msg,
        text: result
      })
    } else {
      outputMessages.push(msg)
    }
  })

  return outputMessages
}

export const clearTraderQuoteRequest = async (telegramId, broker) => {
  return broker.call('session.delete', { key: `${telegramId}_IN_ACTIVE_QUOTE_REQUEST` })
}

export const setTraderInActiveQuoteRequest = async (telegramId, quoteRequest, broker) => {
  const quoteRequestId = _.get(quoteRequest, 'quoteRequestId', null)

  await broker.call('session.setWithoutTimeout', { key: `${telegramId}_QUOTE_REQUEST_ID`, value: quoteRequestId })
  return broker.call('session.setWithoutTimeout', { key: `${telegramId}_IN_ACTIVE_QUOTE_REQUEST`, value: true })
}

export const getActiveQuoteRequest = async (telegramId, broker) => {
  if (!(await isTraderInActiveQuoteRequest(telegramId, broker))) {
    return null
  }
  return {
    quoteRequestId: await broker.call('session.get', { key: `${telegramId}_QUOTE_REQUEST_ID` })
  }
}

export const isTraderInActiveQuoteRequest = async (telegramId, broker) => {
  const inActiveQuoteRequest = await broker.call('session.get', { key: `${telegramId}_IN_ACTIVE_QUOTE_REQUEST` })
  return (!_.isNil(inActiveQuoteRequest) && inActiveQuoteRequest) ? inActiveQuoteRequest : false
}

export const formatPriceValue = (rawPriceValue, offset = 2) => {
  let displayPrice = parseFloat(Math.round((rawPriceValue * Math.pow(10, offset)).toFixed(1)) / Math.pow(10, offset)).toFixed(offset)
  return displayPrice - rawPriceValue === 0 ? rawPriceValue : displayPrice
}

export default {
  isTraderInActiveQuoteRequest,
  setTraderInActiveQuoteRequest,
  processOutgoing,
  formatPriceValue
}
