const expect = require('chai').expect

import StreamClient from './stream-client'

describe('StreamClient', () => {
  describe('instantiation', () => {
    it('should work without error', () => {
      expect(() => new StreamClient()).not.throw()
    })
  })
})
