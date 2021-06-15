import sreHelper from '../../util/sre-helper'
import createMobOrder from '../../util/create-mob-order'
/**
 * Handles "rfq_reply_one_way intent, when a Market Maker answer to an RFQ
 *
 * @param {Object} trader - Trader object
 * @param {Object} sreAnswer - SRE Answer Object
 * @param {Object} broker - Molecular broker object
 * @return {Object} OutgoingMessage to be sent to the user
 */
export const handleRFQOneWayReply = async (trader, sreAnswer, broker) => {
  const sreContext = sreHelper.getContext(sreAnswer)
  let text = sreAnswer.output.text[0]
  try {
    const mobOrder = createMobOrder(sreContext, trader)
    await broker.call('mob.quote.add', mobOrder)
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
