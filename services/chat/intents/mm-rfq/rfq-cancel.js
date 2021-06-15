import { defaultErrorMessage } from '../../lib/messageMapping'

export async function handleRFQCancel (broker, rfqId, userId, sreAnswer) {
  const activeRfq = await broker.call('rfq.getActiveRfq', { rfqId, traderId: userId })
  try {
    await broker.call('mob.order.cancel.one', { security: activeRfq.financialInstrument.label, userId: userId })
  } catch (error) {
    return { text: defaultErrorMessage(error) }
  }

  await broker.call('db.rfq.findAndUpdate', {
    find: {
      rfqId: rfqId,
      marketMakerTelegramId: userId,
      status: ['OPEN', 'ACTIVE']
    },
    update: {
      status: 'CANCELLED'
    }
  })

  return { text: sreAnswer.output.text[0] }
}
