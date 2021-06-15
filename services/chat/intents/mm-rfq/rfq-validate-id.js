import _ from 'lodash'
import sreHelper from '../../util/sre-helper'
import createMobOrder from '../../util/create-mob-order'
import { RFQ_DISPLAY_LIMIT } from '../../util/constants'
import { createMsg } from '../../util/common'
import { handleRFQCancel } from './rfq-cancel'

const generateRfqsList = (limit, rfq) => {
  let lines = ''
  let i = 0
  let newline = ''

  while (i < limit && rfq[i] !== undefined) {
    newline = (i < limit) ? '\n' : ''
    lines = lines + `/${rfq[i].rfqId} ${rfq[i].volume} ${rfq[i].financialInstrument.label}/USD` + newline
    i++
  }

  return lines
}

const sreAnswerConfirmRfq = (hasActiveRfq, broker, sreAnswer) => (
  broker.call('sre.send', {
    toSRE: {
      sessionId: sreHelper.getSessionId(sreAnswer),
      context: {
        topic: 'rfq_id_unknown',
        user_has_active_rfq: hasActiveRfq
      }
    }
  })
)

async function handleRFQValidatedReply (broker, rfqId, trader, sreContext, sreAnswer) {
  let marketPrice = _.get(sreContext, 'market_price', null)
  const activeRfq = await broker.call('rfq.getActiveRfq', { rfqId, traderId: trader.telegramId })
  if (marketPrice === null) {
    const tradingInfo = await broker.call('price.getCurrentTradingInfo', {
      coin: activeRfq.financialInstrument.label,
      currency: 'USD'
    })
    marketPrice = tradingInfo.PRICE
  }
  let sreAnswerConfirm = await broker.call('sre.send', {
    toSRE: {
      sessionId: sreHelper.getSessionId(sreAnswer),
      context: {
        topic: 'rfq_reply',
        security: activeRfq.financialInstrument.label,
        volume: activeRfq.volume,
        market_price: marketPrice,
        rfq_id: rfqId
      }
    }
  })
  let message
  let intentName = sreHelper.getIntentName(sreAnswerConfirm)
  sreContext = sreHelper.getContext(sreAnswerConfirm)
  try {
    const mobOrder = createMobOrder(sreContext, trader, intentName)
    mobOrder.bidPrice && mobOrder.offerPrice
      ? await broker.call('mob.quote.add2Way', mobOrder)
      : await broker.call('mob.quote.add', mobOrder)

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
    message = sreAnswerConfirm.output.text[0]
  } catch (err) {
    err.sreContext = sreContext
    throw err
  }
  return {
    text: message,
    contextParams: {
      price: sreContext.price,
      opposing_side: sreContext.opposing_side,
      rfq_volume: activeRfq.volume,
      rfq_security: activeRfq.financialInstrument.label
    }
  }
}

async function handleRFQValidatedCancel (broker, rfqId, userId, sreAnswer) {
  let sreAnswerConfirm = await broker.call('sre.send', {
    toSRE: {
      sessionId: sreHelper.getSessionId(sreAnswer),
      input: { text: '' },
      context: {
        topic: 'rfq_cancel',
        rfq_id: rfqId
      }
    }
  })

  return handleRFQCancel(broker, rfqId, userId, sreAnswerConfirm)
}

/**
 * Handles "rfq_reply" intent, when a Market Maker answer to an RFQ
 *
 * @param {Object} trader - Trader object
 * @param {Object} sreAnswer - SRE Answer Object
 * @param {Object} broker - Molecular broker object
 * @return {Object} OutgoingMessage to be sent to the user
 */
export const handleRFQValidateId = async (trader, sreAnswer, broker) => {
  let topic = sreAnswer.context.topic
  let sreContext = sreHelper.getContext(sreAnswer)
  const rfqId = sreContext.rfq_id
  let count

  // Validate RFQ ID
  const isRfqActive = await broker.call('rfq.isActive', { rfqId, traderId: trader.telegramId })

  let answer, message, query
  if (isRfqActive) {
    switch (topic) {
      case 'rfq_reply':
        return handleRFQValidatedReply(broker, rfqId, trader, sreContext, sreAnswer)
      case 'rfq_cancel':
        return handleRFQValidatedCancel(broker, rfqId, trader.telegramId, sreAnswer)
      default:
        break
    }
  } else {
    let rfqs
    const activeRfqs = await broker.call('db.rfq.findActive', { id: trader.telegramId })

    activeRfqs
      ? rfqs = activeRfqs
      : rfqs = await broker.call('db.rfq.findWithLimit', {
        id: trader.telegramId,
        limit: RFQ_DISPLAY_LIMIT
      })

    answer = await sreAnswerConfirmRfq(!!activeRfqs, broker, sreAnswer)
    if (!rfqs) {
      return createMsg(
        `I'm sorry there is no RFQ with ID /{unknown_rfq_id}`,
        { unknown_rfq_id: answer.context.unknown_rfq_id }
      )
    }

    count = await broker.call('db.rfq.count', {
      marketMakerTelegramId: { $eq: trader.telegramId },
      status: ['OPEN', 'ACTIVE']
    })

    message = createMsg(
      answer.output.text[0] + '\n\n',
      activeRfqs
        ? {
          number_of_active_rfqs: count,
          unknown_rfq_id: answer.context.unknown_rfq_id
        }
        : { unknown_rfq_id: answer.context.unknown_rfq_id }
    )

    query = createMsg(generateRfqsList(count || RFQ_DISPLAY_LIMIT, rfqs))

    return [message, query]
  }
}
