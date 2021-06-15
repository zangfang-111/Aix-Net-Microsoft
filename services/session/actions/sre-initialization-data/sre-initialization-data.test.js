// eslint-disable-next-line
const debug = require('debug')('AiX:services:session:actions:sre-initialization-data')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe(`Session - Initiaization Data`, async () => {
  const sessionDataParams = {
    userId: '12345',
    sessionData: {
      topic: 'quote_reply',
      security: 'BTC',
      volume: '1000'
    }
  }

  // eslint-disable-next-line
  beforeAll(async function () {
    await broker.loadService(`./services/session/session.service.js`)
    await broker.start()
  })

  // eslint-disable-next-line
  afterAll(function () {
    broker.stop()
  })

  afterEach(async () => {
    await broker.call('session.sre-initialization-data.delete', {
      userId: '12345'
    })
  })

  it('SET & GET Should work as expected with valid inputs', async () => {
    await broker.call('session.sre-initialization-data.set', sessionDataParams)

    const sessionData = await broker.call('session.sre-initialization-data.get', {
      userId: '12345'
    })

    expect(sessionData).toMatchObject(sessionDataParams.sessionData)
  })

  it('Only the last set data should be saved', async () => {
    await broker.call('session.sre-initialization-data.set', sessionDataParams)

    let sessionData = await broker.call('session.sre-initialization-data.get', {
      userId: '12345'
    })

    expect(sessionData).toMatchObject(sessionDataParams.sessionData)

    const updatedSessionDataParams = {
      userId: '12345',
      sessionData: {
        topic: 'trade',
        security: 'ETH',
        volume: '5000'
      }
    }
    await broker.call('session.sre-initialization-data.set', updatedSessionDataParams)

    sessionData = await broker.call('session.sre-initialization-data.get', {
      userId: '12345'
    })

    expect(sessionData).toMatchObject(updatedSessionDataParams.sessionData)
  })

  it('GET Sre Initialization Data should return null if no data is set', async () => {
    let sessionData = await broker.call('session.sre-initialization-data.get', {
      userId: '12345'
    })
    expect(sessionData).toBe(null)
  })

  it('Delete initialization data should work as expected', async () => {
    await broker.call('session.sre-initialization-data.set', sessionDataParams)

    let sessionData = await broker.call('session.sre-initialization-data.get', {
      userId: '12345'
    })

    expect(sessionData).toMatchObject(sessionDataParams.sessionData)

    const resp = await broker.call('session.sre-initialization-data.delete', {
      userId: '12345'
    })

    expect(resp).toBe(3)
  })
})
