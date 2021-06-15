import { ServiceBroker } from 'moleculer'
import chatLogger from './chat-logger'
import Chat from '../../../services/db/actions/chat/model'

const expect = require('chai').expect
const broker = new ServiceBroker({ logger: console })

const services = ['session', 'db']
services.forEach(serviceName => {
  broker.loadService(`${__dirname}/../../../services/${serviceName}/${serviceName}.service.js`)
})

describe('ChatLogger', () => {
  // eslint-disable-next-line
  before(async function () {
    await broker.start()
    await Chat.deleteMany({})
  })

  // eslint-disable-next-line
  after(async function () {
    await Chat.deleteMany({})
    await broker.stop()
  })

  it('Should save text messages exchanged by a user with bot', async () => {
    const ctx = {
      message: {
        from: {
          id: 'test-trader'
        },
        text: 'hi'
      },
      reply: () => {}
    }
    const next = async (ctx) => {
      await broker.call('session.set', { key: 'test-trader_SRE_SESSION_ID', value: 'test-session-id' })
      return ['Hello, test trader']
    }
    await chatLogger(broker)(ctx, next)
    const messages = await Chat.find({})
    expect(messages).to.be.an('array')
    expect(messages.length).to.equal(2)
    expect(messages[0].senderId).to.equal('test-trader')
    expect(messages[1].senderId).to.equal('test-trader')
    expect(messages[0].isBotMessage).to.equal(false)
    expect(messages[1].isBotMessage).to.equal(true)
    expect(messages[0].message).to.equal('hi')
    expect(messages[1].message).to.equal('Hello, test trader')
    expect(messages[1].sessionId).to.equal('test-session-id')
  })
})
