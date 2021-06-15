const expect = require('chai').expect

import chatHelper from './chat-helper'

describe('ChatHelper', () => {
  describe('processOutgoing()', () => {
    // TODO: Add tests for replaceing placeholders using message context params

    it('should work as expected replaceing all placeholders for one message', () => {
      const sreContextParams = {
        intent: 'add_order',
        security: 'BTC',
        side: 'bid',
        price: 6100,
        volume: 10
      }

      const messages = [
        { text: 'Thank you, working a {price} {side} for {volume} {security}' }
      ]

      const outgoingMessages = chatHelper.processOutgoing(messages, sreContextParams)

      expect(outgoingMessages).to.be.an('array')
      expect(outgoingMessages.length).to.equal(messages.length)
      expect(outgoingMessages[0].text).to.equal(`Thank you, working a $${sreContextParams.price} ${sreContextParams.side} for ${sreContextParams.volume} ${sreContextParams.security}/USD`)
    })

    it('should work as expected replaceing all placeholders for multiple messages', () => {
      const sreContextParams = {
        intent: 'add_order',
        security: 'BTC',
        side: 'bid',
        price: 6100,
        volume: 10
      }

      const messages = [
        { text: 'Thank you, working a {price} {side} for {volume} {security}' },
        { text: 'Let me know if you want to work an other {side} for {security}' }
      ]

      const outgoingMessages = chatHelper.processOutgoing(messages, sreContextParams)

      expect(outgoingMessages).to.be.an('array')
      expect(outgoingMessages.length).to.equal(messages.length)
      expect(outgoingMessages[0].text).to.equal(
        `Thank you, working a $${sreContextParams.price} ${sreContextParams.side} for ${sreContextParams.volume} ${sreContextParams.security}/USD`)
      expect(outgoingMessages[1].text).to.equal(
        `Let me know if you want to work an other ${sreContextParams.side} for ${sreContextParams.security}/USD`)
    })

    it('should return placeholder if is not found as parameter', () => {
      const sreContextParams = {
        intent: 'add_order',
        security: 'BTC',
        side: 'bid',
        price: 6100,
        volume: 10
      }

      const messages = [
        { text: 'Thank you, working a {placeholde_not_found} {side} for {volume} {security}' }
      ]

      const outgoingMessages = chatHelper.processOutgoing(messages, sreContextParams)

      expect(outgoingMessages).to.be.an('array')
      expect(outgoingMessages.length).to.equal(messages.length)
      expect(outgoingMessages[0].text).to.equal(`Thank you, working a {placeholde_not_found} ${sreContextParams.side} for ${sreContextParams.volume} ${sreContextParams.security}/USD`)
    })

    it('should ignore other message types - like images', () => {
      const messages = [
        { image: 'http://www.xxxxxx.xx/xxx.xxx' }
      ]

      const outgoingMessages = chatHelper.processOutgoing(messages, {})

      expect(outgoingMessages).to.be.an('array')
      expect(outgoingMessages.length).to.equal(messages.length)
      expect(outgoingMessages[0].image).to.equal(messages[0].image)
    })
  })

  describe('formatPriceValue()', () => {
    it('should display without decimal', () => {
      const price = 4100
      const displayPrice = chatHelper.formatPriceValue(price, 2)
      expect(displayPrice.toString()).to.equal('4100')
    })

    it('should display with 1 decimal', () => {
      const price = 4100.8
      const displayPrice = chatHelper.formatPriceValue(price, 2)
      expect(displayPrice.toString()).to.equal('4100.8')
    })

    it('4100.235” expected to be “4100.24', () => {
      const price = 4100.235
      const displayPrice = chatHelper.formatPriceValue(price, 2)
      expect(displayPrice.toString()).to.equal('4100.24')
    })

    it('4100.234” expected to be “4100.23', () => {
      const price = 4100.234
      const displayPrice = chatHelper.formatPriceValue(price, 2)
      expect(displayPrice.toString()).to.equal('4100.23')
    })
  })
})
