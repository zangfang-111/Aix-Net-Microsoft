import messages from './index'

const {
  msgExecutedOrders
} = messages

describe('Messages', () => {
  describe('Executed Orders Average', () => {
    it('msgExecutedOrders - when netExecutedVolume is positive', () => {
      const msg = msgExecutedOrders('BTC', 4000, 2000, 5000, 1000, 1000, 1111)

      expect(msg).toBe(`So far you have paid $4000 for 2000 BTC ` +
      `and you have sold 1000 BTC at $5000, which leaves you long 1000 BTC from $1111 on the day`)
    })

    it('msgExecutedOrders - when netExecutedVolume is negative', () => {
      const msg = msgExecutedOrders('BTC', 4000, 2000, 5000, 1000, -1000, 1111)

      expect(msg).toBe(`So far you have paid $4000 for 2000 BTC ` +
      `and you have sold 1000 BTC at $5000, which leaves you short -1000 BTC from $1111 on the day`)
    })

    it('msgExecutedOrders - when netExecutedVolume === 0', () => {
      const msg = msgExecutedOrders('BTC', 4000, 2000, 5000, 1000, 0, 1111)

      expect(msg).toBe(`So far you have paid $4000 for 2000 BTC ` +
      `and you have sold 1000 BTC at $5000`)
    })
  })
})
