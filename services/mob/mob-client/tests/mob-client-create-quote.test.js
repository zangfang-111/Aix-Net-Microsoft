const expect = require('chai').expect
const nock = require('nock')

import { MobClient, MOB_SERVICE_URL } from '../mob-client'

const DELAY_TO_UPDATE_QUOTE = 6000

const mobCreateQuoteResponse =
  require('../test-data/mob-create-quote-response')
const ENBALE_REST_MOCKING = false
let inst = null
let traderTelegramId = Math.floor(Math.random() * 999999999) + 111111111
let security = 'ETHUSD'
let quoteResponse = null

describe('MobClient', () => {
  let quotesList = []
  beforeAll(() => {
    inst = new MobClient()
    jest.setTimeout(10000)
  })

  afterAll(async () => {
    if (quotesList.length > 0) {
      for (let i = 0; i < quotesList.length; i++) {
        await inst.cancelOrder(quotesList[i].id)
      }
      quotesList = []
    }
  })

  describe('instantiation', () => {
    it('should work without error', () => {
      expect(() => new MobClient()).not.throw()
    })
  })

  describe('handleSuccess() function', () => {
    it('should work as expected', () => {
      let apiResponse = {
        'status': 200,
        'headers': {},
        'config': {},
        'request': {},
        'data': {
          'header': {
          },
          'data': [{
            'test': 'test',
            'test2': 'test2'
          }],
          'messageType': 10000,
          'category': 1
        }
      }

      let response = inst.handleSuccess(apiResponse)

      expect(response).to.deep.equal(apiResponse.data)
    })
  })

  describe('createQuote() function', () => {
    it('should work as expected', async (done) => {
      if (ENBALE_REST_MOCKING) {
        nock(MOB_SERVICE_URL)
          .post('/orders')
          .reply(200, mobCreateQuoteResponse
          )
      }

      quoteResponse = await inst.createQuote({
        side: 'BUY',
        quantity: 5,
        security,
        price: 9500.16,
        traderTelegramId
      })
      quotesList.push(quoteResponse)

      expect(typeof quoteResponse).to.equal('object')
      expect(quoteResponse.side).to.equal('BUY')
      expect(quoteResponse.price).to.equal(9500.16)
      expect(quoteResponse.quantity).to.equal(5)
      expect(quoteResponse.trader).to.equal(traderTelegramId.toString())
      expect(quoteResponse.isQuote).to.equal(true)

      setTimeout(done, DELAY_TO_UPDATE_QUOTE)
    })
  })

  describe('createQuote() function', () => {
    beforeEach(async (done) => {
      if (ENBALE_REST_MOCKING) {
        let mockedResponse = mobCreateQuoteResponse

        mockedResponse.quote.quantity = 0.000001
        nock(MOB_SERVICE_URL)
          .post('/orders')
          .reply(200, mockedResponse)
      }

      quoteResponse = await inst.createQuote({
        side: 'BUY',
        quantity: 0.000001,
        security,
        price: 9502.3,
        traderTelegramId
      })
      quotesList.push(quoteResponse)

      setTimeout(done, DELAY_TO_UPDATE_QUOTE)
    })

    it('should work with min volume', async () => {
      expect(typeof quoteResponse).to.equal('object')
      expect(quoteResponse.side).to.equal('BUY')
      expect(quoteResponse.price).to.equal(9502.3)
      expect(quoteResponse.quantity).to.equal(0.000001)
      expect(quoteResponse.trader).to.equal(traderTelegramId.toString())
      expect(quoteResponse.isQuote).to.equal(true)
    })
  })

  describe('createQuote() function', () => {
    beforeEach(async (done) => {
      if (ENBALE_REST_MOCKING) {
        let mockedResponse = mobCreateQuoteResponse

        mockedResponse.quote.quantity = 0.0005
        nock(MOB_SERVICE_URL)
          .post('/orders')
          .reply(200, mobCreateQuoteResponse
          )
      }

      quoteResponse = await inst.createQuote({
        side: 'BUY',
        quantity: 0.0005,
        security,
        price: 9501.5,
        traderTelegramId
      })
      quotesList.push(quoteResponse)

      setTimeout(done, DELAY_TO_UPDATE_QUOTE)
    })

    it('should work with fractional volumes', async () => {
      expect(typeof quoteResponse).to.equal('object')
      expect(quoteResponse.side).to.equal('BUY')
      expect(quoteResponse.price).to.equal(9501.5)
      expect(quoteResponse.quantity).to.equal(0.0005)
      expect(quoteResponse.trader).to.equal(traderTelegramId.toString())
      expect(quoteResponse.isQuote).to.equal(true)
    })
  })
})
