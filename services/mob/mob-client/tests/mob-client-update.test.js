const expect = require('chai').expect
// eslint-disable-next-line
const debug = require('debug')('AiX:mob:tests')

import { MobClient } from '../mob-client'

const DELAY_TO_UPDATE_ORDER = 4000
let inst = null
let traderTelegramId = Math.floor(Math.random() * 999999999) + 111111111
let security = 'ETHUSD'
let ordersList = []
let updatedOrder = null

describe('MobClient', () => {
  let buyOrder

  beforeAll(async () => {
    inst = new MobClient()
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

  // describe('searchAndUpdateOrder() function', () => {
  //   beforeEach(async (done) => {
  //     buyOrder = await inst.createOrder({
  //       side: 'BUY',
  //       quantity: 200,
  //       security,
  //       price: 40000000,
  //       traderTelegramId
  //     })
  //     debug(buyOrder)
  //     setTimeout(done, 800)
  //   })

  //   it('should update the order', async () => {
  //     const params = {
  //       'orderStatuses': ['Open'],
  //       'price': buyOrder.price,
  //       'quantity': buyOrder.quantity,
  //       'security': security,
  //       'side': buyOrder.side,
  //       'traderTelegramId': traderTelegramId
  //     }
  //     const updatedOrder = await inst.searchAndUpdateOrder(params, 40000001, 201)
  //     ordersList.push(updatedOrder)

  //     expect(updatedOrder.price).to.equal(40000001)
  //     expect(updatedOrder.quantity).to.equal(201)
  //   })
  // })

  describe('updateOrderPriceAndVolume(price) function', () => {
    beforeEach(async (done) => {
      buyOrder = await inst.createOrder({
        side: 'BUY',
        quantity: 211,
        security,
        price: 44556665,
        traderTelegramId
      })

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })

    it('should update the order price', async (done) => {
      updatedOrder = await inst.updateOrderPriceAndVolume(buyOrder.id, 44556666)
      ordersList.push(updatedOrder)

      expect(updatedOrder.price).to.equal(44556666)
      expect(updatedOrder.quantity).to.equal(211)

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })

    it('should update the order price and volume', async (done) => {
      updatedOrder = await inst.updateOrderPriceAndVolume(buyOrder.id, 44556661, 221)
      ordersList.push(updatedOrder)

      expect(updatedOrder.price).to.equal(44556661)
      expect(updatedOrder.quantity).to.equal(221)

      setTimeout(done, DELAY_TO_UPDATE_ORDER)
    })
  })
})
