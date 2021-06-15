import {
  MIN_ACCEPTED_VOLUME,
  MAX_ACCEPTED_VOLUME
} from '../util/constants'

/**
 * Handles an "add-order" intent
 *
 * @param {Object} ctx - Molecular context
 * @param {string} security
 * @param {string} side - Order side: bid, offer
 * @param {number} price
 * @param {number} volume The size of the underlying security, any number higher than zero and can have upto '8' digits
 * @param {number} telegramId - User's telegram ID
 * @return {string} The orderId of the created order.
 */
export const handleAddOrderIntent = async (ctx, security, side, price, volume, telegramId, confirmedSoftThreshold) => {
  if (!(side === 'BID' || side === 'OFFER')) {
    throw new Error('Sorry. I don\'t understand. Please try again')
  }

  if (volume === undefined || volume < MIN_ACCEPTED_VOLUME || volume > MAX_ACCEPTED_VOLUME) {
    throw new Error('Oups. It seems the volume you requested is not right. Please try again')
  }

  if (price <= 0) {
    throw new Error('Oups. It seems the price you entered is not right. Please try again')
  }

  const orderParams = {
    security,
    side,
    volume,
    price,
    telegramId,
    confirmedSoftThreshold
  }

  let orderId
  switch (orderParams.side.toUpperCase()) {
    case 'B':
    case 'BID':
      orderParams.side = 'BUY'
      orderId = await ctx.broker.call('mob.order.add', orderParams)
      break

    case 'S':
    case 'OFFER':
      orderParams.side = 'SELL'
      orderId = await ctx.broker.call('mob.order.add', orderParams)
      break

    default:
      return [
        { text: 'Invalid order type' }
      ]
  }

  return orderId
}
