import { formatPriceValue } from '../chat/util/chat-helper'

const rfqMsg = (mmName, volume, security, currentMarketPrice, rfqId) => {
  return `Hello ${mmName}, I'm looking for a two way price in ${volume} ${security}, last trading at $${formatPriceValue(currentMarketPrice)} ([Source](coinroutes.com)). Price request /${rfqId}.`
}

export default {
  rfqMsg
}
