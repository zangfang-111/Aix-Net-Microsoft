import {
  isTraderInActiveQuoteRequest,
  clearTraderQuoteRequest
} from '../../util/chat-helper'
import botMessages from '../../messages'

async function quoteRequestExpired ({ traderId }) {
  // Don't show the quote request end message because the trader might not be in a Quote Reuqest anymore
  // He canceled it
  // TODO: Close the streams when the trader cancels the Quote Request so that this message is not triggered anymore
  if (!(await isTraderInActiveQuoteRequest(traderId, this.broker))) {
    return
  }

  await this.broker.call('session.clearUserSession', { traderId })
  clearTraderQuoteRequest(traderId, this.broker)
  this.broker.call('web.pushBatch', {
    messages: [{
      id: traderId,
      text: botMessages.quoteEnd
    }]
  })
}

export default quoteRequestExpired
