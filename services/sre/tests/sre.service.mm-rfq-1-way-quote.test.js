// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:mm-rfq')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - MM Standard 2-WAY RFQs - Handle Inverted Prices', () => {
  const QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY = '/{rfq_id} Thank you, working a {price} {side} for {rfq_volume} {rfq_security}. You can also show me an {opposing_side} or re-quote with both sides.'
  const QUOTE_REPLY_SUCCESS_MESSAGE_TWO_WAY =
    `/{rfq_id} Alright, I'm working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you.`
  const QUOTE_REPLY_SUCCESS_MESSAGE_OPPOSE_WAY =
    `/{rfq_id} Thank you, working a {price} {opposing_side} for {rfq_volume} {rfq_security}.`
  const UNKNOWN_RFQ_ID =
    `I'm sorry there is no RFQ with ID /{unknown_rfq_id} here are the latest 3 RFQs:`
  const SIDE_OR_REQUOTE = `/{rfq_id} Please specify a side or re-quote`
  const PRICE_OR_REQUOTE = `/{rfq_id} Please specify a price or re-quote`

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

  /**
   * ! AC1
   */
  it('Complete one way quote request by mm with two way follow up quote', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200 bid'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3250/3275'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.rfq_bid_price).toBe(3250)
    expect(sreRfqAnswer.context.rfq_offer_price).toBe(3275)
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_TWO_WAY)
  })

  it('Complete one way quote request by mm with two way follow up quote - With RFQ ID - Variation 1', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200 bid /1'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3250/3275'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.rfq_bid_price).toBe(3250)
    expect(sreRfqAnswer.context.rfq_offer_price).toBe(3275)
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_TWO_WAY)
  })

  it('Complete one way quote request by mm with two way follow up quote - With RFQ ID - Variation 2', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '/1 3200 bid'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3250/3275'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.rfq_bid_price).toBe(3250)
    expect(sreRfqAnswer.context.rfq_offer_price).toBe(3275)
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_TWO_WAY)
  })

  it('Complete one way quote request by mm with two way follow up quote - Incorrect RFQ ID', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200 bid /2'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('validate_rfq_id')
    expect(sreRfqAnswer.context.rfq_id).toBe(2)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.output.text[0]).toBe('{/validate rfq id}')

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: ''
      },
      context: {
        topic: 'rfq_id_unknown',
        user_has_active_rfq: false
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_id_unknown')
    expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
    expect(sreRfqAnswer.output.text[0]).toBe(UNKNOWN_RFQ_ID)
  })

  it('Complete one way quote request by mm with one way follow up quote', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200 bid'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.price).toBe(3200)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3250 offer'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_oppose_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.context.price).toBe(3250)
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_OPPOSE_WAY)
  })

  it('Complete one way quote request by mm with one way follow up quote - Variation', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3250 offer'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.price).toBe(3250)
    expect(sreRfqAnswer.context.side).toBe('offer')
    expect(sreRfqAnswer.context.opposing_side).toBe('bid')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3200 offer'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_oppose_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.context.price).toBe(3200)
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_OPPOSE_WAY)
  })

  /**
 * ! AC2
 */
  it('One way quote request reply by mm with price followed by two way price', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.output.text[0]).toBe(SIDE_OR_REQUOTE)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3250/3275'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.rfq_bid_price).toBe(3250)
    expect(sreRfqAnswer.context.rfq_offer_price).toBe(3275)
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_TWO_WAY)
  })

  it('One way quote request reply by mm with price only followed by side', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.output.text[0]).toBe(SIDE_OR_REQUOTE)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: 'bid'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.price).toBe(3200)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)
  })

  it('One way quote request reply by mm with price only followed by price side', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.output.text[0]).toBe(SIDE_OR_REQUOTE)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3200 bid'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.price).toBe(3200)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)
  })

  /**
 * ! AC3
 */
  it('One way quote request reply by mm with side only followed by price side', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: 'bid'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.output.text[0]).toBe(PRICE_OR_REQUOTE)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3200 bid'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.price).toBe(3200)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)
  })

  it('One way quote request reply by mm with side only followed by price', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: 'bid'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.output.text[0]).toBe(PRICE_OR_REQUOTE)

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: '3200'
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_reply_one_way')
    expect(sreRfqAnswer.context.rfq_id).toBe(1)
    expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
    expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
    expect(sreRfqAnswer.context.price).toBe(3200)
    expect(sreRfqAnswer.context.side).toBe('bid')
    expect(sreRfqAnswer.context.opposing_side).toBe('offer')
    expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE_ONE_WAY)
  })

  it('Complete quote request by mm after RFQ has been recieved and is active then responds with wrong two way price RFQ ID', async () => {
    let sreRfqAnswer
    let toSRE = {
      input: {
        text: '3200/3250 /2'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('validate_rfq_id')
    expect(sreRfqAnswer.context.rfq_id).toBe(2)
    expect(sreRfqAnswer.output.text[0]).toBe('{/validate rfq id}')

    toSRE = {
      sessionId: sreRfqAnswer.sessionId,
      input: {
        text: ''
      },
      context: {
        topic: 'rfq_id_unknown',
        user_has_active_rfq: false
      }
    }
    sreRfqAnswer = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer.context.intent).toBe('rfq_id_unknown')
    expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
    expect(sreRfqAnswer.output.text[0]).toBe(UNKNOWN_RFQ_ID)
  })
})
