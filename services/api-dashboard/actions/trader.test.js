import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'
import Trader from '../../db/actions/trader/model'
import trader from './trader'

const broker = new ServiceBroker({ logger: false })

let newTrader

describe('Api Dashboard Trader Actions', () => {
  beforeAll(async function () {
    await broker.loadService(`./services/db/db.service.js`)
    await broker.start()
    newTrader = new Trader({
      'email': 'trader@gmail.com',
      'telegramId': '737493320'
    })
    await newTrader.save()
  })

  afterAll(async function () {
    await Trader.deleteMany({})
    await broker.stop()
  })

  describe('Get all traders', () => {
    it('should return all the traders', async () => {
      const ctx = {
        broker
      }
      const response = await trader.get.handler(ctx)
      expect(typeof response[0]).to.equal('object')
      expect(response[0].email).to.equal('trader@gmail.com')
      expect(response[0].telegramId).to.equal('737493320')
    })
  })

  describe('Get trader by ID', () => {
    it('should return the requested trader', async () => {
      const ctx = {
        params: {
          traderId: newTrader._id
        },
        broker
      }
      const response = await trader.getById.handler(ctx)
      expect(typeof response).to.equal('object')
      expect(response.email).to.equal('trader@gmail.com')
      expect(response.telegramId).to.equal('737493320')
    })
  })

  describe('Get trader by telegramId', () => {
    it('should return the requested trader', async () => {
      const ctx = {
        params: {
          id: newTrader.telegramId
        },
        broker
      }
      const response = await trader.getByTelegramId.handler(ctx)
      expect(typeof response).to.equal('object')
      expect(response.email).to.equal('trader@gmail.com')
      expect(response.telegramId).to.equal('737493320')
    })
  })

  describe('Update trader', () => {
    it('should return the updated trader', async () => {
      const ctx = {
        params: {
          id: newTrader._id,
          email: 'updated@gmail.com',
          telegramId: newTrader.telegramId
        },
        broker
      }
      const response = await trader.update.handler(ctx)
      expect(typeof response).to.equal('object')
      expect(response.email).to.equal('updated@gmail.com')
      expect(response.telegramId).to.equal('737493320')
    })
  })

  describe('Delete trader', () => {
    it('should delete the trader & return the deleted message', async () => {
      const ctx = {
        params: {
          id: newTrader._id
        },
        broker
      }
      const response = await trader.delete.handler(ctx)
      expect(response).to.equal(`Trader with id: ${ctx.params.id} has been removed`)
    })
  })
})
