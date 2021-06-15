import {
  isTraderInActiveQuoteRequest
} from '../util/chat-helper'
import botMessages from '../messages'

async function sessionExpired ({ userId }) {
  // If Trader is in price request, we don't handle the session expired event. This is handled by quote.request.end event
  if (await isTraderInActiveQuoteRequest(userId, this.broker)) {
    console.log('isTraderInActiveQuoteRequest')
    return
  }

  await this.broker.call('session.clearUserSession', { userId })
  this.broker.call('web.pushBatch', {
    messages: [{
      id: userId,
      text: botMessages.sessionExpired
    }]
  })
}

export default sessionExpired
