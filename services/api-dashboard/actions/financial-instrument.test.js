import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'
import FinancialInstrument from '../../db/actions/financial-instrument/model'
import financialInstrument from './financial-instrument'

const broker = new ServiceBroker({ logger: false })

let newFinancialInstrument

describe('Api Dashboard Financial Instrument Actions', () => {
  beforeAll(async function () {
    await broker.loadService(`./services/db/db.service.js`)
    await broker.start()
    newFinancialInstrument = new FinancialInstrument({
      'label': 'TEST_ETH',
      'name': 'test_ethereum',
      'category': 'crypto'

    })
    await newFinancialInstrument.save()
  })

  afterAll(async function () {
    await FinancialInstrument.deleteMany({})
    await broker.stop()
  })

  describe('Get all financial instruments', () => {
    it('should return all financial instruments', async () => {
      const ctx = {
        broker
      }
      const response = await financialInstrument.get.handler(ctx)
      expect(typeof response[0]).to.equal('object')
      expect(response[0].label).to.equal('TEST_ETH')
      expect(response[0].name).to.equal('test_ethereum')
      expect(response[0].category).to.equal('crypto')
    })
  })
})
