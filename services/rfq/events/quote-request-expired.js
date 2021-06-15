import _ from 'lodash'
import { RFQ_STATUSES } from '../constants'

async function quoteRequestExpired (quoteRequest, broker) {
  const quoteRequestId = _.get(quoteRequest, 'quoteRequestId', null)

  if (quoteRequestId === null) {
    return false
  }

  // Get RFQs with quoteRequestId and update them with timeout status
  const rfqsList = await broker.call('db.rfq.findAndUpdate', {
    find: { quoteRequestId },
    update: { status: RFQ_STATUSES.CLOSED_BY_TIMEOUT }
  })

  rfqsList.map(async rfq => {
    const trader = await broker.call('db.trader.show', {
      telegramId: rfq.marketMakerTelegramId
    })
    await broker.call('session.sre-initialization-data.delete', {
      userId: trader.id
    })
    broker.call('web.pushBatch', {
      messages: [{
        id: rfq.marketMakerTelegramId,
        text: `/${rfq.rfqId} This ${rfq.volume} ${rfq.financialInstrument.label} expired.`
      }]
    })
  })
}

export default quoteRequestExpired
