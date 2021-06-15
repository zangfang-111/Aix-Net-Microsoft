import { generateCardImage, uploadImageToS3 } from '../lib/info-card'

function formatThousandsSeparator (num) {
  let numParts = num.toString().split('.')
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return numParts.join('.')
}

/**
 * Action used to create Info card.
 * @param {*} ctx
 * @param {*} ctx.params
 * - content
 */

export default {
  params: {
    content: {
      type: 'object',
      props: {
        now: { type: 'string', lenght: 8 },
        currentPrice: { type: 'number', positive: true },
        dayLowPrice: { type: 'number', positive: true },
        dayHighPrice: { type: 'number', positive: true }
      }
    }
  },
  async handler (ctx) {
    const { content } = ctx.params
    try {
      content.currentPrice = formatThousandsSeparator(content.currentPrice.toFixed(2))
      content.dayLowPrice = Math.ceil(content.dayLowPrice)
      content.dayHighPrice = Math.ceil(content.dayHighPrice)
      content.pair = content.coin + content.currency
      const filePath = await generateCardImage(content)
      const url = await uploadImageToS3(filePath)
      return url
    } catch (error) {
      return null
    }
  }
}
