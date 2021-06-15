import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'

import FinancialInstrument from '../../db/actions/financial-instrument/model'
import Trader from '../../db/actions/trader/model'
import QuoteRequest from '../../db/actions/quote-request/model'
import actions from './quote-request'

const broker = new ServiceBroker({ logger: false })

let newQuoteRequest
let newTrader
let newFinancialInstrument

describe('Api Dashboard Price Request Actions', () => {
  beforeAll(async function () {
    await broker.loadService(`./services/db/db.service.js`)
    await broker.start()

    newTrader = new Trader({ 'email': 'trader@gmail.com', 'telegramId': '737493320' })
    newFinancialInstrument = new FinancialInstrument({ 'label': 'eth', 'name': 'eth', 'category': 'crypto' })
    newQuoteRequest = new QuoteRequest({
      initiatingTrader: newTrader.id,
      financialInstrument: newFinancialInstrument.id,
      quantity: 5555,
      quoteRequestId: 123456,
      status: 'OPEN',
      createdQuoteRequestEvent: {}
    })
    await newQuoteRequest.save()
  })

  afterAll(async function () {
    await QuoteRequest.deleteMany({})
    await Trader.deleteMany({})
    await FinancialInstrument.deleteMany({})
    await broker.stop()
  })

  describe('Get all price requests', () => {
    it('should return all the price requests', async () => {
      const ctx = {
        broker
      }
      const response = await actions.get.handler(ctx)
      expect(typeof response[0]).to.equal('object')
      expect(response[0].priceRequestId).to.equal(123)
      expect(response[0].telegramId).to.equal('737493320')
      expect(response[0].status).to.equal('OPEN')
    })
  })

  describe('Get price request by ID', () => {
    it('should return the requested trader', async () => {
      const ctx = {
        params: {
          id: newQuoteRequest._id
        },
        broker
      }
      const response = await actions.getById.handler(ctx)
      expect(typeof response).to.equal('object')
      expect(response.priceRequestId).to.equal(123)
      expect(response.telegramId).to.equal('737493320')
      expect(response.status).to.equal('OPEN')
    })
  })

  describe('Delete price request', () => {
    it('should delete the price request & return the deleted message', async () => {
      const ctx = {
        params: {
          id: newQuoteRequest._id
        },
        broker
      }
      const response = await actions.delete.handler(ctx)
      expect(response).to.equal(`Quote request with id: ${ctx.params.id} has been removed`)
    })
  })
})
