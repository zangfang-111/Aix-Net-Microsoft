// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:mm-rfq')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - cancel RFQ', () => {
  const CANCEL_RFQ_REPLY = '/{rfq_id} Canceled, working nothing for you.'
  const CANCEL_NO_RFQID = "I'm sorry there is no RFQ with ID /{unknown_rfq_id} here are your {number_of_active_rfqs} active ones:"

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

  let sessionId

  beforeEach(async function () {
    let toSRE = {
      input: {
        text: '/1 2000/4000'
      },
      context: {
        topic: 'rfq_reply',
        security: 'BTC',
        volume: 1000,
        market_price: 3200,
        rfq_id: 1
      }
    }

    let initialAnswer = await broker.call('sre.send', { toSRE })
    sessionId = initialAnswer.sessionId
  })

  it('Cancel last RFQ', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: { text: 'cancel' },
      context: {}
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('rfq_cancel')
    expect(sreRfqAnswer1.output.text[0]).toBe(CANCEL_RFQ_REPLY)
  })

  it('Immediatly cancel last RFQ with rfqId', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: { text: '/1 cancel' },
      context: {}
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('rfq_cancel')
    expect(sreRfqAnswer1.context.rfq_id).toBe(1)
  })

  it('Immediatly cancel last RFQ with rfqId - variation', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: { text: 'cancel /1' },
      context: {}
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('rfq_cancel')
    expect(sreRfqAnswer1.context.rfq_id).toBe(1)
  })

  it('Cancel RFQ with rfqId', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: { text: '/2 cancel' },
      context: {}
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('validate_rfq_id')
    expect(sreRfqAnswer1.context.rfq_id).toBe(2)
    expect(sreRfqAnswer1.context.topic).toBe('rfq_cancel')

    toSRE = {
      sessionId: sessionId,
      input: { text: '' },
      context: {
        topic: sreRfqAnswer1.context.topic,
        rfq_id: sreRfqAnswer1.context.rfq_id
      }
    }

    let sreRfqAnswer2 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer2.context.rfq_id).toBe(2)
    expect(sreRfqAnswer2.output.text[0]).toBe(CANCEL_RFQ_REPLY)
  })

  it('Cancel RFQ with rfqId - variation', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: {
        text: 'cancel /2',
        context: {}
      }
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('validate_rfq_id')
    expect(sreRfqAnswer1.context.rfq_id).toBe(2)
    expect(sreRfqAnswer1.context.topic).toBe('rfq_cancel')

    toSRE = {
      sessionId: sessionId,
      text: '',
      context: {
        topic: sreRfqAnswer1.context.topic,
        rfq_id: sreRfqAnswer1.context.rfq_id
      }
    }

    let sreRfqAnswer2 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer2.context.rfq_id).toBe(2)
    expect(sreRfqAnswer2.output.text[0]).toBe(CANCEL_RFQ_REPLY)
  })

  it('Cancel RFQ with unknown rfqId', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: { text: '/2 cancel' },
      context: {}
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('validate_rfq_id')
    expect(sreRfqAnswer1.context.rfq_id).toBe(2)
    expect(sreRfqAnswer1.context.topic).toBe('rfq_cancel')

    toSRE = {
      sessionId: sessionId,
      text: '',
      context: {
        topic: 'rfq_id_unknown',
        user_has_active_rfq: true
      }
    }

    let sreRfqAnswer2 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer2.context.unknown_rfq_id).toBe(2)
    expect(sreRfqAnswer2.output.text[0]).toBe(CANCEL_NO_RFQID)
  })

  it('Cancel RFQ with unknown rfqId - variation', async () => {
    let toSRE = {
      sessionId: sessionId,
      input: { text: 'cancel /2' },
      context: {}
    }
    let sreRfqAnswer1 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer1.context.intent).toBe('validate_rfq_id')
    expect(sreRfqAnswer1.context.rfq_id).toBe(2)
    expect(sreRfqAnswer1.context.topic).toBe('rfq_cancel')

    toSRE = {
      sessionId: sessionId,
      text: '',
      context: {
        topic: 'rfq_id_unknown',
        user_has_active_rfq: true
      }
    }

    let sreRfqAnswer2 = await broker.call('sre.send', { toSRE })

    expect(sreRfqAnswer2.context.unknown_rfq_id).toBe(2)
    expect(sreRfqAnswer2.output.text[0]).toBe(CANCEL_NO_RFQID)
  })
})
