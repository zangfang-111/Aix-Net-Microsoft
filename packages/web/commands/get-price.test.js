import { getPriceCommand } from './get-price'
import messages from './messages'

const expect = require('chai').expect

describe('GetPrice Command', () => {
  it('Should say \'provide both\' when either volume or security is not provided', async () => {
    const ctx = {
      message: {
        from: {
          id: '123456789'
        },
        text: '/getprice BTCUSD'
      }
    }
    const res = await getPriceCommand(ctx)
    expect(res).to.be.an('array')
    expect(res.length).to.equal(1)
    expect(res[0].text).to.equal(messages.price.missing)
  })

  it('Should say create message when success', async () => {
    const ctx = {
      message: {
        from: {
          id: '123456789'
        },
        text: '/getprice BTCUSD 10'
      }
    }
    const broker = {
      call () {
        return 713416050
      }
    }
    const res = await getPriceCommand(ctx, broker)
    expect(res).to.be.an('array')
    expect(res.length).to.equal(1)
    expect(res[0].text).to.equal(messages.price.created(713416050))
  })

  it('Should return error message when failed', async () => {
    const ctx = {
      message: {
        from: {
          id: '123456789'
        },
        text: '/getprice BTCUSD 10'
      }
    }
    const broker = {
      call () {
        return null
      }
    }
    const res = await getPriceCommand(ctx, broker)
    expect(res).to.be.an('array')
    expect(res.length).to.equal(1)
    expect(res[0].text).to.equal(messages.price.error)
  })
})
