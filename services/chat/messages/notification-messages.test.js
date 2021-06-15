const expect = require('chai').expect

import notificationMessages from './notification-messages'

const notificationResponse = require('./test-data/create-notification-response')

describe('NotificationMessages', () => {
  describe('orderExecuted()', () => {
    it('should work as expected with full filled buy order notification', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.buyOrderFullFilled.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.buyOrderFullFilled.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.buyOrderFullFilled.notification.text)
    })

    it('should work as expected with partially filled buy order notification', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.buyOrderPartiallyFilled.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.buyOrderPartiallyFilled.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.buyOrderPartiallyFilled.notification.text)
    })

    it('should work as expected with full filled sell order notification', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.sellOrderFullFilled.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.sellOrderFullFilled.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.sellOrderFullFilled.notification.text)
    })

    it('should work as expected with partially filled sell order notification', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.sellOrderPartiallyFilled.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.sellOrderPartiallyFilled.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.sellOrderPartiallyFilled.notification.text)
    })

    it('should work as expected with twoWayBuyFillSellFill', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWayBuyFillSellFill.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWayBuyFillSellFill.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWayBuyFillSellFill.notification.text)
    })

    it('should work as expected with twoWayBuyFillSellPartial', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWayBuyFillSellPartial.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWayBuyFillSellPartial.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWayBuyFillSellPartial.notification.text)
    })

    it('should work as expected with twoWayBuyFillSellNone', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWayBuyFillSellNone.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWayBuyFillSellNone.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWayBuyFillSellNone.notification.text)
    })

    it('should work as expected with twoWayBuyPartialSellFill', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWayBuyPartialSellFill.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWayBuyPartialSellFill.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWayBuyPartialSellFill.notification.text)
    })

    it('should work as expected with twoWayBuyPartialSellPartial', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWayBuyPartialSellPartial.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWayBuyPartialSellPartial.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWayBuyPartialSellPartial.notification.text)
    })

    it('should work as expected with twoWayBuyPartialSellNone', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWayBuyPartialSellNone.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWayBuyPartialSellNone.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWayBuyPartialSellNone.notification.text)
    })

    it('should work as expected with twoWaySellFillBuyNone', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWaySellFillBuyNone.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWaySellFillBuyNone.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWaySellFillBuyNone.notification.text)
    })

    it('should work as expected with twoWaySellPartialBuyNone', () => {
      const orderExecutedNotification = notificationMessages.orderExecuted(notificationResponse.twoWaySellPartialBuyNone.order).messages[0]

      expect(typeof orderExecutedNotification).to.equal('object')
      expect(orderExecutedNotification.id).to.equal(notificationResponse.twoWaySellPartialBuyNone.notification.id)
      expect(orderExecutedNotification.text).to.equal(notificationResponse.twoWaySellPartialBuyNone.notification.text)
    })
  })
})
