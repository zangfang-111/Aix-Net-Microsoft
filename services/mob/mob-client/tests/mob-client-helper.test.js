const expect = require('chai').expect

import mobClientHelper from '../mob-client-helper'

const finCreateOrderResponse = require('../test-data/mob-create-order-response')

describe('mobClientHelper', () => {
  describe('orderView()', () => {
    it('should work as expected with expected create order response', () => {
      const orderView = mobClientHelper.orderView(finCreateOrderResponse.order)

      expect(typeof orderView).to.equal('object')
      expect(orderView.firm).to.equal(finCreateOrderResponse.order.clearingFirm)
      expect(orderView.security).to.equal(finCreateOrderResponse.order.symbol)
      expect(orderView.status).to.equal(finCreateOrderResponse.order.orderStatus)
      expect(orderView.side).to.equal(finCreateOrderResponse.order.side)
      expect(orderView.userid).to.equal(finCreateOrderResponse.order.userId)
      expect(orderView.trader).to.equal(finCreateOrderResponse.order.trader)
      expect(orderView.price).to.equal(finCreateOrderResponse.order.price)
      expect(orderView.quantity).to.equal(finCreateOrderResponse.order.quantity)
      expect(orderView.origQty).to.equal(finCreateOrderResponse.order.originalQuantity)
      expect(orderView.liveQty).to.equal(finCreateOrderResponse.order.liveQuantity)
      expect(orderView.execQty).to.equal(finCreateOrderResponse.order.executionQuantity)
    })
  })
})
