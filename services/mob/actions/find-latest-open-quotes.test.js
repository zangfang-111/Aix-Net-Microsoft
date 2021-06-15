const expect = require('chai').expect
import findLatestOpenQuotes from './find-latest-open-quotes'

const orderData = [
  {
    orderStatuses: 'Open',
    isQuote: true,
    trader: '123456789',
    price: 1000
  },
  {
    orderStatuses: 'Open',
    isQuote: true,
    trader: '123456789',
    price: 2000
  },
  {
    orderStatuses: 'Open',
    isQuote: true,
    trader: '123456789',
    price: 3000
  },
  {
    orderStatuses: 'Open',
    isQuote: true,
    trader: '123456789',
    price: 4000
  },
  {
    orderStatuses: 'Open',
    isQuote: true,
    trader: '123456788',
    price: 5000
  },
  {
    orderStatuses: 'Open',
    isQuote: true,
    trader: '123456788',
    price: 6000
  }
]

const callFactory = () => (telegramId) => {
  return new Promise((resolve, reject) => {
    const quotes = orderData.filter(order => order.isQuote && order.trader === telegramId && order.orderStatuses === 'Open')
    resolve(quotes)
  })
}

describe(`Find latest open quotes for trader`, () => {
  describe(`Case: trader has more than 3 open quotes`, () => {
    const ctx = {
      params: {
        telegramId: '123456789'
      },
      service: {
        mobClient: {
          getOpenQuotesByTraderId: jest.fn(callFactory())
        }
      }
    }

    it('should return latest open 3 quotes', async () => {
      const quotes = await findLatestOpenQuotes.handler(ctx)
      expect(quotes).to.be.an('array')
      expect(quotes).to.have.lengthOf(3)
      expect(quotes).to.have.lengthOf.at.most(3)
    })
  })

  describe(`Case: trader has less than 3 open quotes`, () => {
    const ctx = {
      params: {
        telegramId: '123456788'
      },
      service: {
        mobClient: {
          getOpenQuotesByTraderId: jest.fn(callFactory())
        }
      }
    }

    it('should return latest open 2 quotes', async () => {
      const quotes = await findLatestOpenQuotes.handler(ctx)
      expect(quotes).to.be.an('array')
      expect(quotes).to.have.lengthOf(2)
      expect(quotes).to.have.lengthOf.at.most(3)
    })
  })

  describe(`Case: trader has none open quotes`, () => {
    const ctx = {
      params: {
        telegramId: '123456787'
      },
      service: {
        mobClient: {
          getOpenQuotesByTraderId: jest.fn(callFactory())
        }
      }
    }

    it('should return null', async () => {
      const quotes = await findLatestOpenQuotes.handler(ctx)
      expect(quotes).to.be.a('null')
    })
  })
})
