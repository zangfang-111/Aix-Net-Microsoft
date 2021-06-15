import { ServiceBroker } from 'moleculer'
import traders from './traders'
import Trader from '../../db/actions/trader/model'

const expect = require('chai').expect
const broker = new ServiceBroker({ logger: console })

broker.loadService(`${__dirname}/../../../services/db/db.service.js`)

describe('Aix Next API [GET Trader Profile]', () => {
  let traderId = null
  // eslint-disable-next-line
  before(async function () {
    await broker.start()
    await Trader.deleteMany({})

    const newTrader = new Trader({
      telegramId: '012345678',
      mobileNumber: '0123456789',
      firstName: 'test',
      lastName: 'trader',
      email: 'test@test.com',
      companyName: 'test company',
      sessionId: 'test-session-id'
    })

    await newTrader.save()
    traderId = newTrader.id
  })

  // eslint-disable-next-line
  after(async function () {
    await Trader.deleteMany({})
    await broker.stop()
  })

  it('Should return the trader', async () => {
    const ctx = {
      params: {
        traderId: traderId
      },
      broker
    }
    const res = await traders.get(ctx)
    expect(res).to.be.an('object')
    expect(res.id).to.equal(traderId)
    expect(res.telegramId).to.equal('012345678')
    expect(res.mobileNumber).to.equal('0123456789')
    expect(res.firstName).to.equal('test')
    expect(res.lastName).to.equal('trader')
    expect(res.email).to.equal('test@test.com')
    expect(res.companyName).to.equal('test company')
    expect(res.sessionId).to.equal('test-session-id')
  })
})
