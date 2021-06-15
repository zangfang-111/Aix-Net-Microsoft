import DecisionController from './DecisionController'
const expect = require('chai').expect

describe('DecisionController', () => {
  describe('instance', () => {
    it('should contain the needed constants', () => {
      const instance = new DecisionController()
      expect(instance).to.have.all.keys(
        'MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC',
        'MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC'
      )
      expect(instance.MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC).to.be.a('number')
      expect(instance.MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC).to.be.a('number')
    })
  })
})
