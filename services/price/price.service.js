import actions from './actions'

module.exports = {
  name: 'price',
  dependencies: [
    'db'
  ],

  created () {
    this.cacheTradingInfo = ''
  },

  actions: {
    ...actions
  },

  async started () {
    this.broker.logger.info(`Price Service Started`)
    let base = {
      'USD': {
        response: {},
        responseAt: 0
      },
      'EUR': {
        response: {},
        responseAt: 0
      }
    }
    let response = {}
    let data = await this.broker.call('db.financialInstrument.get')
    this.broker.logger.info(`Price Service Get Financial Instruments`)
    this.broker.logger.info(data)

    data.map(security => {
      response[security.label] = base
    })
    this.cacheTradingInfo = response
    this.broker.logger.info(`Init cacheTradingInfo`)
    this.broker.logger.info(this.cacheTradingInfo)
  }
}
