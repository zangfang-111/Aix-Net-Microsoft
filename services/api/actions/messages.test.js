import { ServiceBroker } from 'moleculer'
import messages from './messages'
import Chat from '../../db/actions/chat/model'

const expect = require('chai').expect
const broker = new ServiceBroker({ logger: console })

broker.loadService(`${__dirname}/../../../services/db/db.service.js`)

describe('Aix Next API [GET Trader\'s Messages History]', () => {
  // eslint-disable-next-line
  before(async function () {
    await broker.start()
    await Chat.deleteMany({})

    await broker.call('db.chat.create', {
      sessionId: 'test-session-id',
      senderId: 'test-sender-id',
      message: 'hi',
      isBotMessage: false
    })
    await broker.call('db.chat.create', {
      sessionId: 'test-session-id',
      senderId: 'test-sender-id',
      message: 'Hello, test-trader',
      isBotMessage: true
    })
  })

  // eslint-disable-next-line
  after(async function () {
    await Chat.deleteMany({})
    await broker.stop()
  })

  it('Should return messages exchanged by a user with the bot', async () => {
    const ctx = {
      params: {
        traderId: 'test-sender-id',
        toDate: new Date(new Date().getTime() + 86400000).toString()
      },
      broker
    }
    const res = await messages.get(ctx)
    expect(res).to.be.an('object')
    expect(res.count).to.equal(2)
    expect(res.data).to.be.an('array')
    expect(res.data.length).to.equal(2)
  })
})
