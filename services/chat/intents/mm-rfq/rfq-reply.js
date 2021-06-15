import sreHelper from '../../util/sre-helper'
import {
  createAdd2WayQuoteRequest
} from '../../lib/requestFactory'

/**
 * Handles "rfq_reply" intent, when a Market Maker answer to an RFQ
 *
 * @param {Object} trader - Trader object
 * @param {Object} sreAnswer - SRE Answer Object
 * @param {Object} broker - Molecular broker object
 * @return {Object} OutgoingMessage to be sent to the user
 */
export const handleRFQReply = async (trader, sreAnswer, broker) => {
  const intentName = sreHelper.getIntentName(sreAnswer)
  const sreContext = sreHelper.getContext(sreAnswer)
  let text = sreAnswer.output.text[0]

  try {
    const mobOderAdd2WayQuoteRequest = createAdd2WayQuoteRequest(intentName, sreContext, Number(trader.telegramId), false)
    await broker.call('mob.quote.add2Way', mobOderAdd2WayQuoteRequest)
    await broker.call('db.rfq.findAndUpdate', {
      find: {
        rfqId: sreContext.rfq_id,
        marketMakerTelegramId: trader.telegramId,
        status: 'OPEN'
      },
      update: {
        status: 'ACTIVE'
      }
    })
    text = { text }
  } catch (err) {
    throw err
  }
  return text
}
