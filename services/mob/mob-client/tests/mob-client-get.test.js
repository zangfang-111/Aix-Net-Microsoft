const expect = require('chai').expect

import { MobClient } from '../mob-client'

let inst = null
let traderTelegramId = Math.floor(Math.random() * 999999999) + 111111111
let security = 'ETHUSD'
let returnedSecurity = null

describe('MobClient - Search orders', () => {
  let ordersList = []
  let buyOrder = null
  let sellOrder = null
  const traderId = traderTelegramId

  beforeAll(async (done) => {
    jest.setTimeout(10000)
    inst = new MobClient()
    returnedSecurity = inst.getSecurity('ETHUSD')

    buyOrder = await inst.createOrder({
      side: 'BUY',
      quantity: 223,
      security,
      price: 44556666,
      traderTelegramId: traderId
    })
    ordersList.push(buyOrder)
    sellOrder = await inst.createOrder({
      side: 'SELL',
      quantity: 112,
      security,
      price: 88888888,
      traderTelegramId: traderId
    })
    ordersList.push(sellOrder)

    setTimeout(done, 4000)
  })

  afterAll(async () => {
    if (ordersList.length > 0) {
      for (let i = 0; i < ordersList.length; i++) {
        await inst.cancelOrder(ordersList[i].id)
      }
      ordersList = []
    }
  })

  describe('getOpenOrdersByTraderId() function', () => {
    it('should work as expected', async () => {
      let getOpenOrdersRespons = await inst.getOpenOrdersByTraderId(traderTelegramId)

      expect(getOpenOrdersRespons).to.be.an('array')
      expect(getOpenOrdersRespons.length).to.equal(ordersList.length)
      expect(getOpenOrdersRespons[0].trader).to.equal(traderTelegramId.toString())
    })

    it('search by SIDE should work as expected', async () => {
      let getOpenOrdersRespons = await inst.getOpenOrdersByTraderId(traderTelegramId, null, 'BUY')

      expect(getOpenOrdersRespons).to.be.an('array')
      expect(getOpenOrdersRespons.length).to.equal(1)
      expect(getOpenOrdersRespons[0].side).to.equal(buyOrder.side)
      expect(getOpenOrdersRespons[0].price).to.equal(buyOrder.price)
      expect(getOpenOrdersRespons[0].quantity).to.equal(buyOrder.quantity)
      expect(getOpenOrdersRespons[0].trader).to.equal(traderTelegramId.toString())
    })

    it('search by SECURITY should work as expected', async () => {
      let getOpenOrdersRespons = await inst.getOpenOrdersByTraderId(traderTelegramId, security)

      expect(getOpenOrdersRespons).to.be.an('array')
      expect(getOpenOrdersRespons.length).to.equal(2)
      expect(getOpenOrdersRespons[0].security).to.equal(returnedSecurity)
      expect(getOpenOrdersRespons[0].trader).to.equal(traderTelegramId.toString())
    })

    it('search by SIDE & SECURITY should work as expected', async () => {
      let getOpenOrdersRespons = await inst.getOpenOrdersByTraderId(traderTelegramId, security, 'BUY')

      expect(getOpenOrdersRespons).to.be.an('array')
      expect(getOpenOrdersRespons.length).to.equal(1)
      expect(getOpenOrdersRespons[0].security).to.equal(returnedSecurity)
      expect(getOpenOrdersRespons[0].price).to.equal(buyOrder.price)
      expect(getOpenOrdersRespons[0].quantity).to.equal(buyOrder.quantity)
      expect(getOpenOrdersRespons[0].trader).to.equal(traderTelegramId.toString())
    })
  })
})
