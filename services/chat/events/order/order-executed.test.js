import orderExecuted from './order-executed'
import TestData from './test-data'

const callFactory = () => (service, params) => {
  return new Promise((resolve, reject) => {
    if (service === 'db.order.executed') {
      resolve(TestData.sortedOrders)
    }
    resolve(true)
  })
}

describe(`orderExecuted()`, async () => {
  const ctx = {
    orders: TestData.executedOrders,
    serviceBroker: {
      call: jest.fn(callFactory()),
      logger: {
        info: jest.fn(),
        error: jest.fn()
      }
    }
  }

  it('Should broadcasted correct message when received executed order', async function (done) {
    const result = await orderExecuted(ctx.orders, ctx.serviceBroker)
    const output = TestData.ordersForNotification

    expect(result[0]).toEqual(output[0])
    expect(result[1]).toEqual(output[1])
    expect(result[2]).toEqual(output[2])

    const orders = ctx.orders
    expect(ctx.serviceBroker.call).nthCalledWith(1, 'db.order.executed', { orders })

    const messages = TestData.messages
    expect(ctx.serviceBroker.call).nthCalledWith(2, 'web.pushBatch', { messages })

    done()
  })
})
