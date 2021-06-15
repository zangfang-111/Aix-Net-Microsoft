// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:mm-rfq')

import { ServiceBroker } from 'moleculer'

const broker = new ServiceBroker({ logger: false })

describe('SRE Service - MM Standard 2-WAY RFQs', () => {
  const QUOTE_REPLY_INTENT = 'rfq_reply'
  const RFQ_ID_UNKNOWN_INTENT = 'rfq_id_unknown'
  const VALIDATE_RFQ_ID_INTENT = 'validate_rfq_id'
  const QUOTE_REPLY_SUCCESS_MESSAGE =
    `/{rfq_id} Alright, I'm working {rfq_bid_price}/{rfq_offer_price} for you in {rfq_volume} {rfq_security}. Thank you.`
  const RFQ_UNKNOWN_REPLY_WITH_ACTIVE_RFQS =
    `I'm sorry there is no RFQ with ID /{unknown_rfq_id} here are your {number_of_active_rfqs} active ones:`
  const RFQ_UNKNOWN_REPLY_WITH_INACTIVE_RFQS =
    `I'm sorry there is no RFQ with ID /{unknown_rfq_id} here are the latest 3 RFQs:`

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

  describe('RFQ Reply With Context Set', () => {
    let sreRfqAnswer

    it('Should work as expected with RFQ_ID set in context and user inputs 2-WAY price without RFQ_ID', async () => {
      let toSRE = {
        input: {
          text: '2000/3000'
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

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID set in context and user inputs 2-WAY price with RFQ_ID at the end of the message', async () => {
      let toSRE = {
        input: {
          text: '2000/3000 /2'
        },
        context: {
          topic: 'rfq_reply',
          rfq_id: 2,
          security: 'BTC',
          volume: 1000,
          market_price: 3200
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID set in context and user inputs 2-WAY price with RFQ_ID at the end of the message - variation', async () => {
      let toSRE = {
        input: {
          text: '2000-3000 /2'
        },
        context: {
          topic: 'rfq_reply',
          rfq_id: 2,
          security: 'BTC',
          volume: 1000,
          market_price: 3200
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected  with RFQ_ID set in context and user inputs 2-WAY price with RFQ_ID at the start of the message', async () => {
      let toSRE = {
        input: {
          text: '/2 2000/3000'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 2
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected  with RFQ_ID set in context and user inputs 2-WAY price with RFQ_ID at the start of the message - variation', async () => {
      let toSRE = {
        input: {
          text: '/2 2000-3000'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 2
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID set in context and user inputs 2-WAY price with RFQ_ID different then the one from the context', async () => {
      let toSRE = {
        input: {
          text: '2000/3000 /5'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 2
        }
      }
      sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(5)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_reply',
            security: 'BTC',
            volume: 1000,
            market_price: 3200,
            rfq_id: 5
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(5)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ context set and user inputs a price request', async () => {
      let toSRE = {
        input: {
          text: 'price for 7000 btc'
        },
        context: {
          topic: 'rfq_reply',
          security: 'BTC',
          volume: 1000,
          market_price: 3200,
          rfq_id: 2
        }
      }

      let sreAnswer = await broker.call('sre.send', { toSRE })

      debug(sreAnswer)

      expect(sreAnswer.context.intent).toBe('price_request')
      expect(sreAnswer.context.security).toBe('BTC')
      expect(sreAnswer.context.volume).toBe(7000)
      expect(sreAnswer.context.display_card).toBe('crypto_rates')
      expect(sreAnswer.output.text[0]).toBe(`Here is the latest {security} update. I am working to get you a price for  {volume} {security}. Type cancel at any time to cancel this request.`)
    })

    it('Should work with "choice"', async () => {
      let toSRE = {
        input: {
          text: 'choice 2000'
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

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(1)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })
  })

  describe('RFQ Reply Without Context Set', () => {
    it('Should work as expected with RFQ_ID added at the end of the message and valid RFQ_ID', async () => {
      let toSRE = {
        input: {
          text: '2000/3000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is valid and send RFQ details
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_reply',
            security: 'BTC',
            volume: 1000,
            market_price: 3200,
            rfq_id: 2
          }
        }
      })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID added at the end of the message and valid RFQ_ID - variation', async () => {
      let toSRE = {
        input: {
          text: '2000-3000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is valid and send RFQ details
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_reply',
            security: 'BTC',
            volume: 1000,
            market_price: 3200,
            rfq_id: 2
          }
        }
      })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID added at the start of the message and valid RFQ_ID', async () => {
      let toSRE = {
        input: {
          text: '/2 2000/3000'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is valid and send RFQ details
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_reply',
            security: 'BTC',
            volume: 1000,
            market_price: 3200,
            rfq_id: 2
          }
        }
      })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID added at the start of the message and valid RFQ_ID - variation', async () => {
      let toSRE = {
        input: {
          text: '/2 2000-3000'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is valid and send RFQ details
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_reply',
            security: 'BTC',
            volume: 1000,
            market_price: 3200,
            rfq_id: 2
          }
        }
      })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })

    it('Should work as expected with RFQ_ID added at the start of the message, RFQ_ID unknown and without any active RFQs', async () => {
      let toSRE = {
        input: {
          text: '/2 2000/3000'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM doesn't have active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: false
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(false)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_INACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the start of the message, RFQ_ID unknown and without any active RFQs - variation', async () => {
      let toSRE = {
        input: {
          text: '/2 2000-3000'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM doesn't have active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: false
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(false)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_INACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the end of the message, RFQ_ID unknown and without any active RFQs', async () => {
      let toSRE = {
        input: {
          text: '2000/3000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM doesn't have active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: false
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(false)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_INACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the end of the message, RFQ_ID unknown and without any active RFQs', async () => {
      let toSRE = {
        input: {
          text: '2000-3000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM doesn't have active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: false
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(false)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_INACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the start of the message, RFQ_ID unknown and with active RFQs', async () => {
      let toSRE = {
        input: {
          text: '/2 2000/3000'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM has active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: true
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(true)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_ACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the start of the message, RFQ_ID unknown and with active RFQs - variation', async () => {
      let toSRE = {
        input: {
          text: '/2 2000-3000'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM has active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: true
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(true)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_ACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the end of the message, RFQ_ID unknown and with active RFQs', async () => {
      let toSRE = {
        input: {
          text: '2000/3000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM has active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: true
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(true)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_ACTIVE_RFQS)
    })

    it('Should work as expected with RFQ_ID added at the end of the message, RFQ_ID unknown and with active RFQs - variation', async () => {
      let toSRE = {
        input: {
          text: '2000-3000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)

      // Notify the SRE that the RFQ_ID is unknown and the MM has active RFQs
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_id_unknown',
            user_has_active_rfq: true
          }
        }
      })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(RFQ_ID_UNKNOWN_INTENT)
      expect(sreRfqAnswer.context.user_has_active_rfq).toBe(true)
      expect(sreRfqAnswer.context.unknown_rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(3000)
      expect(sreRfqAnswer.output.text[0]).toBe(RFQ_UNKNOWN_REPLY_WITH_ACTIVE_RFQS)
    })

    it('Should work as expected with "choice", RFQ_ID added at the end of the message and valid RFQ_ID', async () => {
      let toSRE = {
        input: {
          text: 'choice 2000 /2'
        }
      }
      let sreRfqAnswer = await broker.call('sre.send', { toSRE })

      debug(sreRfqAnswer)

      expect(sreRfqAnswer.context.intent).toBe(VALIDATE_RFQ_ID_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)

      // Notify the SRE that the RFQ_ID is valid and send RFQ details
      sreRfqAnswer = await broker.call('sre.send', {
        toSRE: {
          sessionId: sreRfqAnswer.sessionId,
          context: {
            topic: 'rfq_reply',
            security: 'BTC',
            volume: 1000,
            market_price: 3200,
            rfq_id: 2
          }
        }
      })

      expect(sreRfqAnswer.context.intent).toBe(QUOTE_REPLY_INTENT)
      expect(sreRfqAnswer.context.rfq_id).toBe(2)
      expect(sreRfqAnswer.context.rfq_security).toBe('BTC')
      expect(sreRfqAnswer.context.rfq_volume).toBe(1000)
      expect(sreRfqAnswer.context.rfq_bid_price).toBe(2000)
      expect(sreRfqAnswer.context.rfq_offer_price).toBe(2000)
      expect(sreRfqAnswer.output.text[0]).toBe(QUOTE_REPLY_SUCCESS_MESSAGE)
    })
  })
})
