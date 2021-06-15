const expect = require('chai').expect
const nock = require('nock')

import { MobClient, MOB_SERVICE_URL } from '../mob-client'

const DELAY_TO_UPDATE_ORDER = 6000

const mobCreateOrderResponse =
  require('../test-data/mob-create-order-response')
const ENBALE_REST_MOCKING = false
let inst = null
let traderTelegramId = Math.floor(Math.random() * 999999999) + 111111111
let security = 'ETHUSD'
let returnedSecurity = null
let orderResponse = null

describe('MobClient', () => {
  let ordersList = []
  beforeAll(() => {
    inst = new MobClient()
    returnedSecurity = inst.getSecurity('ETHUSD')
    jest.setTimeout(10000)
  })

  afterAll(async () => {
    if (ordersList.length > 0) {
      for (let i = 0; i < ordersList.length; i++) {
        await inst.cancelOrder(ordersList[i].id)
      }
      ordersList = []
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

  describe('createOrder() function', () => {
    it('should work as expected', async (done) => {
      if (ENBALE_REST_MOCKING) {
        nock(MOB_SERVICE_URL)
          .post('/orders')
          .reply(200, mobCreateOrderResponse
          )
      }

      orderResponse = await inst.createOrder({
        side: 'BUY',
        quantity: 5,
        security,
        price: 9500.16,
        traderTelegramId
      })
      ordersList.push(orderResponse)

      expect(typeof orderResponse).to.equal('object')
      expect(orderResponse.side).to.equal('BUY')
      expect(orderResponse.security).to.equal(returnedSecurity)
      expect(orderResponse.price).to.equal(9500.16)
      expect(orderResponse.quantity).to.equal(5)
      expect(orderResponse.trader).to.equal(traderTelegramId.toString())

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })
  })

  describe('createOrder() function', () => {
    beforeEach(async (done) => {
      if (ENBALE_REST_MOCKING) {
        let mockedResponse = mobCreateOrderResponse

        mockedResponse.order.quantity = 0.000001
        nock(MOB_SERVICE_URL)
          .post('/orders')
          .reply(200, mockedResponse)
      }

      orderResponse = await inst.createOrder({
        side: 'BUY',
        quantity: 0.000001,
        security,
        price: 9502.3,
        traderTelegramId
      })
      ordersList.push(orderResponse)

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })

    it('should work with min volume', async () => {
      expect(typeof orderResponse).to.equal('object')
      expect(orderResponse.side).to.equal('BUY')
      expect(orderResponse.security).to.equal(returnedSecurity)
      expect(orderResponse.price).to.equal(9502.3)
      expect(orderResponse.quantity).to.equal(0.000001)
      expect(orderResponse.trader).to.equal(traderTelegramId.toString())
    })
  })

  describe('createOrder() function', () => {
    beforeEach(async (done) => {
      if (ENBALE_REST_MOCKING) {
        let mockedResponse = mobCreateOrderResponse

        mockedResponse.order.quantity = 0.0005
        nock(MOB_SERVICE_URL)
          .post('/orders')
          .reply(200, mobCreateOrderResponse
          )
      }

      orderResponse = await inst.createOrder({
        side: 'BUY',
        quantity: 0.0005,
        security,
        price: 9501.5,
        traderTelegramId
      })
      ordersList.push(orderResponse)

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })

    it('should work with fractional volumes', async () => {
      expect(typeof orderResponse).to.equal('object')
      expect(orderResponse.side).to.equal('BUY')
      expect(orderResponse.security).to.equal(returnedSecurity)
      expect(orderResponse.price).to.equal(9501.5)
      expect(orderResponse.quantity).to.equal(0.0005)
      expect(orderResponse.trader).to.equal(traderTelegramId.toString())
    })
  })

  describe('cancelOrder() function', () => {
    beforeEach(async (done) => {
      orderResponse = await inst.createOrder({
        side: 'BUY',
        quantity: 15,
        security,
        price: 9501.16,
        traderTelegramId
      })
      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })

    it('should work as expected', async () => {
      let orderId = orderResponse.id

      if (ENBALE_REST_MOCKING) {
        nock(MOB_SERVICE_URL)
          .delete('/orders/' + orderId)
          .reply(200, {})
      }

      let cancelOrderResponse = await inst.cancelOrder(orderId)
      expect(cancelOrderResponse).to.equal(true)
    })
  })
})
