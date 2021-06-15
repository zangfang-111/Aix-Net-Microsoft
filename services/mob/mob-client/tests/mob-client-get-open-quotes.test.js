const expect = require('chai').expect
const nock = require('nock')

import { MobClient, MOB_SERVICE_URL } from '../mob-client'
import { ORDERS_STATUSES } from '../../constants'
import getQuotesResponse from '../test-data/mob-get-quotes-response'

let inst = null
let traderTelegramId = '123456789'
const DELAY_TO_UPDATE_ORDER = 6000

describe('MobClient', () => {
  beforeAll(() => {
    inst = new MobClient()
    jest.setTimeout(10000)
  })

  describe('getOpenQuotesByTraderId() function', () => {
    it('should work as expected', async (done) => {
      const filter = {
        'orderStatuses': ORDERS_STATUSES.OPEN,
        'isQuote': true,
        'trader': traderTelegramId
      }

      nock(MOB_SERVICE_URL)
        .post('/orders/search')
        .reply(200, getQuotesResponse(filter)
        )

      const quoteResponse = await inst.getOpenQuotesByTraderId(filter)

      expect(quoteResponse).to.be.an('array')
      expect(quoteResponse.length).to.equal(2)
      expect(quoteResponse[0].trader).to.equal(traderTelegramId)

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })
  })
})
