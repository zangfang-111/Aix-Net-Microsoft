const chai = require('chai')
const expect = chai.expect
const chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)

import { handleAddOrderIntent } from './add-order'

describe('Intent - Add Order', () => {
  describe('Side - should accept BID or OFFER', () => {
    it('should throw error for anything else', async () => {
      expect(Promise.reject(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BxxxID', 1000, 10, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })
  })

  describe('Price - should be a positive number', () => {
    it('should throw error for negative values', async () => {
      expect(Promise.resolve(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BID', -1000, 10, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })

    it('should throw error for 0', async () => {
      expect(Promise.resolve(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BID', 0, 10, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })
  })

  describe('Volume - should only accept positive numbers higher then 0 and can have upto 8 digits', () => {
    // it('should work as expected for integer values higher then 1', () => {
    // })

    // it('should work as expected for float values higher then 1', () => {
    // })

    // it('should work as expected for float values between 0.0000001 and 1', () => {
    // })

    it('should throw error for volumes lower then 0.0000001', () => {
      expect(Promise.resolve(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BID', 1000, 0.0000009, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })

    it('should throw error for negative volumes', () => {
      expect(Promise.resolve(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BID', 1000, -10, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })

    it('should thors error for volumes equal to 0', () => {
      expect(Promise.resolve(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BID', 1000, 0, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })

    it('should return error for volumes higher then 99,999,999', () => {
      expect(Promise.resolve(
        handleAddOrderIntent.bind(handleAddOrderIntent, {}, 'BTCUSD', 'BID', 1000, 199999999, 123456789)
      )).to.eventually.be.rejectedWith(Error)
    })
  })
})
