import { ServiceBroker } from 'moleculer'
const expect = require('chai').expect

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - Securities', () => {
  const PRICE_REQUEST_INTENT = 'price_request'
  const ADD_ORDER_INTENT = 'add_order'
  const PRICE_REQUEST_START_MESSAGE =
    `Here is the latest {security} update. I am working to get you a price for  {volume} {security}. Type cancel at any time to cancel this request.`
  const BID_SUCCESS_MESSAGE =
    `Thank you, working a {price} bid for {volume} {security}`

  // eslint-disable-next-line
  beforeAll(async function () {
    jest.setTimeout(15000)
    await broker.loadService(`./services/sre/sre.service.js`)
    await broker.start()
  })

  // eslint-disable-next-line
  afterAll(function () {
    broker.stop()
  })

  let sreQuoteRequestAnswer, sreAddOrderAnswer

  it('XRP - Should make a price request for symbol', async () => {
    let toSRE = {}
    toSRE.input = { text: 'price for 7000 xrp' }
    sreQuoteRequestAnswer = await broker.call('sre.send', { toSRE })

    expect(sreQuoteRequestAnswer.context.intent).to.equal(PRICE_REQUEST_INTENT)
    expect(sreQuoteRequestAnswer.context.security).to.equal('XRP')
    expect(sreQuoteRequestAnswer.context.volume).to.equal(7000)
    expect(sreQuoteRequestAnswer.context.display_card).to.equal('crypto_rates')
    expect(sreQuoteRequestAnswer.output.text[0]).to.equal(PRICE_REQUEST_START_MESSAGE)
  })

  it('XRP - Should make a price request for complete name', async () => {
    let toSRE = {}
    toSRE.input = { text: 'price for 7000 ripple' }
    sreQuoteRequestAnswer = await broker.call('sre.send', { toSRE })

    expect(sreQuoteRequestAnswer.context.intent).to.equal(PRICE_REQUEST_INTENT)
    expect(sreQuoteRequestAnswer.context.security).to.equal('XRP')
    expect(sreQuoteRequestAnswer.context.volume).to.equal(7000)
    expect(sreQuoteRequestAnswer.context.display_card).to.equal('crypto_rates')
    expect(sreQuoteRequestAnswer.output.text[0]).to.equal(PRICE_REQUEST_START_MESSAGE)
  })

  it('XRP - Should make a bid for symbol', async () => {
    let toSRE = {}
    toSRE.input = { text: 'please work a 6000 bid for 10 xrp' }

    sreAddOrderAnswer = await broker.call('sre.send', { toSRE })

    expect(sreAddOrderAnswer.context.intent).to.equal(ADD_ORDER_INTENT)
    expect(sreAddOrderAnswer.context.security).to.equal('XRP')
    expect(sreAddOrderAnswer.context.price).to.equal(6000)
    expect(sreAddOrderAnswer.context.volume).to.equal(10)
    expect(sreAddOrderAnswer.context.side).to.equal('bid')
    expect(sreAddOrderAnswer.output.text[0]).to.equal(BID_SUCCESS_MESSAGE)
  })

  it('XRP - Should make a bid for complete name', async () => {
    let toSRE = {}
    toSRE.input = { text: 'please work a 6000 bid for 10 ripple' }

    sreAddOrderAnswer = await broker.call('sre.send', { toSRE })

    expect(sreAddOrderAnswer.context.intent).to.equal(ADD_ORDER_INTENT)
    expect(sreAddOrderAnswer.context.security).to.equal('XRP')
    expect(sreAddOrderAnswer.context.price).to.equal(6000)
    expect(sreAddOrderAnswer.context.volume).to.equal(10)
    expect(sreAddOrderAnswer.context.side).to.equal('bid')
    expect(sreAddOrderAnswer.output.text[0]).to.equal(BID_SUCCESS_MESSAGE)
  })

  it('LTC - Should make a price request for symbol', async () => {
    let toSRE = {}
    toSRE.input = { text: 'price for 7000 ltc' }
    sreQuoteRequestAnswer = await broker.call('sre.send', { toSRE })

    expect(sreQuoteRequestAnswer.context.intent).to.equal(PRICE_REQUEST_INTENT)
    expect(sreQuoteRequestAnswer.context.security).to.equal('LTC')
    expect(sreQuoteRequestAnswer.context.volume).to.equal(7000)
    expect(sreQuoteRequestAnswer.context.display_card).to.equal('crypto_rates')
    expect(sreQuoteRequestAnswer.output.text[0]).to.equal(PRICE_REQUEST_START_MESSAGE)
  })

  it('LTC - Should make a price request for complete name', async () => {
    let toSRE = {}
    toSRE.input = { text: 'price for 7000 litecoin' }
    sreQuoteRequestAnswer = await broker.call('sre.send', { toSRE })

    expect(sreQuoteRequestAnswer.context.intent).to.equal(PRICE_REQUEST_INTENT)
    expect(sreQuoteRequestAnswer.context.security).to.equal('LTC')
    expect(sreQuoteRequestAnswer.context.volume).to.equal(7000)
    expect(sreQuoteRequestAnswer.context.display_card).to.equal('crypto_rates')
    expect(sreQuoteRequestAnswer.output.text[0]).to.equal(PRICE_REQUEST_START_MESSAGE)
  })

  it('LTC - Should make a bid for symbol', async () => {
    let toSRE = {}
    toSRE.input = { text: 'please work a 6000 bid for 10 ltc' }

    sreAddOrderAnswer = await broker.call('sre.send', { toSRE })

    expect(sreAddOrderAnswer.context.intent).to.equal(ADD_ORDER_INTENT)
    expect(sreAddOrderAnswer.context.security).to.equal('LTC')
    expect(sreAddOrderAnswer.context.price).to.equal(6000)
    expect(sreAddOrderAnswer.context.volume).to.equal(10)
    expect(sreAddOrderAnswer.context.side).to.equal('bid')
    expect(sreAddOrderAnswer.output.text[0]).to.equal(BID_SUCCESS_MESSAGE)
  })

  it('LTC - Should make a bid for complete name', async () => {
    let toSRE = {}
    toSRE.input = { text: 'please work a 6000 bid for 10 litecoin' }

    sreAddOrderAnswer = await broker.call('sre.send', { toSRE })

    expect(sreAddOrderAnswer.context.intent).to.equal(ADD_ORDER_INTENT)
    expect(sreAddOrderAnswer.context.security).to.equal('LTC')
    expect(sreAddOrderAnswer.context.price).to.equal(6000)
    expect(sreAddOrderAnswer.context.volume).to.equal(10)
    expect(sreAddOrderAnswer.context.side).to.equal('bid')
    expect(sreAddOrderAnswer.output.text[0]).to.equal(BID_SUCCESS_MESSAGE)
  })
})
