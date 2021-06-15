import { QuoteClient } from './quote-client-wrapper'

let inst = null
let quoteCreateResponse = require('./test-data/quote-test-response')
describe('QuoteClient', () => {
  describe('instantiation', () => {
    it('should work without error', () => {
      expect(() => new QuoteClient()).not.toThrow()
    })
  })

  beforeEach(() => {
    inst = new QuoteClient({
      logger: {
        info: (e) => { console.log(e) },
        warn: (e) => { console.log(e) }
      },
      broadcast: (e) => { console.log(e) },
      call () {}
    })
  })

  describe('handleSuccess() function', () => {
    it('should work as expected', () => {
      let apiResponse = {
        'status': 200,
        'headers': {},
        'config': {},
        'request': {},
        'data': quoteCreateResponse
      }

      let response = inst.handleSuccess(apiResponse)

      expect(response).toMatchObject(quoteCreateResponse)
    })
  })

  describe('createQuote() function', () => {
    it('should work as expected', async () => {
      quoteCreateResponse = await inst.createQuote(10, 'BTCUSD', '123456789')

      expect(typeof quoteCreateResponse.quoteRequestId).toBe('number')
      expect(quoteCreateResponse.quantity).toBe(10)
      expect(quoteCreateResponse.symbol).toBe('BTCUSD')
      expect(quoteCreateResponse.trader).toBe('123456789')
      expect(quoteCreateResponse.status).toBe('Open')
      expect(quoteCreateResponse.latestQuote.quoteRequestId).toBe(quoteCreateResponse.quoteRequestId)
      expect(quoteCreateResponse.latestQuote.bid).toBeDefined()
      expect(quoteCreateResponse.latestQuote.bid.price).toBeDefined()
      expect(quoteCreateResponse.latestQuote.offer).toBeDefined()
      expect(quoteCreateResponse.latestQuote.offer.price).toBeDefined()
    })
  })

  describe('cancelQuote() function', async () => {
    it('should work as expected', async () => {
      let cancelQuateResponse = await inst.cancelQuote(quoteCreateResponse.quoteRequestId)

      expect(cancelQuateResponse.quoteRequestId).toBe(quoteCreateResponse.quoteRequestId)
      expect(cancelQuateResponse.quantity).toBe(quoteCreateResponse.quantity)
      expect(cancelQuateResponse.symbol).toBe(quoteCreateResponse.symbol)
      expect(cancelQuateResponse.trader).toBe(quoteCreateResponse.trader)
      expect(cancelQuateResponse.status).toBe('Cancelled')
    })
  })
})
