module.exports = {
  buyOrderFullFilled: {
    order: [
      { orderId: '6f72646572-c346b4cb-a821-4060-a223-7b012a4aea17',
        trader: '579639723',
        side: 'BUY',
        price: 3600,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 3000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 3000,
        orderStatus: 'Executed',
        orderType: 'ONE',
        executionType: 'T' }
    ],
    notification: {
      id: '579639723',
      text: 'That’s filled, you paid $3600 for 3000BTC'
    }
  },
  sellOrderFullFilled: {
    order: [
      { orderId: '6f72646572-5e21e797-bf08-40a7-9252-5ba1b9b99d30',
        trader: '579639723',
        side: 'SELL',
        price: 3600,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 3000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 3000,
        orderStatus: 'Executed',
        orderType: 'ONE',
        executionType: 'T' }
    ],
    notification: {
      id: '579639723',
      text: 'That’s filled, you sold 3000BTC at $3600'
    }
  },
  buyOrderPartiallyFilled: {
    order: [
      { orderId: '6f72646572-8bf9ac84-336a-4339-804d-3765d799a5c3',
        trader: '579639723',
        side: 'BUY',
        price: 3600,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 1000,
        selfExecutedStatus: 'PARTIAL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'ONE',
        executionType: 'T' }
    ],
    notification: {
      id: '579639723',
      text: 'Partially filled, you paid $3600 for 1000BTC, working the balance.'
    }
  },
  sellOrderPartiallyFilled: {
    order: [
      { orderId: '6f72646572-8bf9ac84-336a-4339-804d-3765d799a5c3',
        trader: '579639723',
        side: 'SELL',
        price: 3600,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 1000,
        selfExecutedStatus: 'PARTIAL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'ONE',
        executionType: 'T' }
    ],
    notification: {
      id: '579639723',
      text: 'Partially filled, you sold 1000BTC at $3600, working the balance.'
    }
  },
  twoWayBuyFillSellFill: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'BUY',
        price: 3601,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 2000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'FILL',
        combinedOrderStatus: 'Executed',
        combinedExecutedPrice: 3602,
        combinedExecutedVolume: 2000,
        combinedOriginalQuantity: 2000,
        executionType: 'B' }
    ],
    notification: {
      id: '579639723',
      text: 'Filled on both, you sold 2000BTC at $3602, and paid $3601 for 2000BTC'
    }
  },
  twoWayBuyFillSellPartial: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'BUY',
        price: 3601,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 2000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Executed',
        combinedExecutedPrice: 3602,
        combinedExecutedVolume: 1000,
        combinedOriginalQuantity: 2000,
        executionType: 'B' }
    ],
    notification: {
      id: '579639723',
      text: 'Filled on your bid. You paid $3601 for 2000BTC. On your offer, partially filled, you sold 1000BTC at $3602, still working the balance here.'
    }
  },
  twoWayBuyFillSellNone: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'BUY',
        price: 3601,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 2000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Open',
        combinedExecutedPrice: 3602,
        combinedExecutedVolume: 0,
        combinedOriginalQuantity: 2000,
        executionType: 'A' }
    ],
    notification: {
      id: '579639723',
      text: 'That’s filled, you paid $3601 for 2000BTC, still working a $3602 offer for 2000BTC'
    }
  },
  twoWayBuyPartialSellFill: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'SELL',
        price: 3602,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 2000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Executed',
        combinedExecutedPrice: 3601,
        combinedExecutedVolume: 1000,
        combinedOriginalQuantity: 2000,
        executionType: 'B' }
    ],
    notification: {
      id: '579639723',
      text: 'Filled on your offer. You sold 2000BTC at $3602. On your bid, partially filled, you paid $3601 for 1000BTC, still working the balance here.'
    }
  },
  twoWayBuyPartialSellPartial: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'SELL',
        price: 3602,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 1000,
        selfExecutedStatus: 'PARTIAL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Executed',
        combinedExecutedPrice: 3601,
        combinedExecutedVolume: 300,
        combinedOriginalQuantity: 800,
        executionType: 'B' }
    ],
    notification: {
      id: '579639723',
      text: 'On your bid, partially filled, you paid $3601 for 300BTC, still working the balance here. Regarding your offer, partially filled, you sold 1000BTC at $3602, still working the balance here.'
    }
  },
  twoWayBuyPartialSellNone: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'BUY',
        price: 3601,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 1000,
        selfExecutedStatus: 'PARTIAL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Open',
        combinedExecutedPrice: 3602,
        combinedExecutedVolume: 0,
        combinedOriginalQuantity: 2000,
        executionType: 'A' }
    ],
    notification: {
      id: '579639723',
      text: 'Partially filled, you paid $3601 for 1000BTC, still working the balance here. Also still working a $3602 offer for 2000BTC'
    }
  },
  twoWaySellFillBuyNone: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'SELL',
        price: 3602,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 2000,
        selfExecutedStatus: 'FILL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Open',
        combinedExecutedPrice: 3601,
        combinedExecutedVolume: 0,
        combinedOriginalQuantity: 2000,
        executionType: 'A' }
    ],
    notification: {
      id: '579639723',
      text: 'That’s filled, you sold 2000BTC at $3602, still working a $3601 bid for 2000BTC'
    }
  },
  twoWaySellPartialBuyNone: {
    order: [
      { orderId: '6f72646572-c2f2557b-18a4-45be-bbae-e43896a15d86',
        trader: '579639723',
        side: 'SELL',
        price: 3602,
        symbol: 'DEVELOPMENT_BTCUSD',
        executionQuantity: 1000,
        selfExecutedStatus: 'PARTIAL',
        originalQuantity: 2000,
        orderStatus: 'Executed',
        orderType: 'TWO',
        combinedId: '6f72646572-dd7eecd2-fd92-4335-a6c9-62d5bec9d3e9',
        combinedExecutedStatus: 'PARTIAL',
        combinedOrderStatus: 'Open',
        combinedExecutedPrice: 3601,
        combinedExecutedVolume: 0,
        combinedOriginalQuantity: 2000,
        executionType: 'A' }
    ],
    notification: {
      id: '579639723',
      text: 'Partially filled, you sold 1000BTC at $3602, still working the balance here. Also still working a $3601 bid for 2000BTC'
    }
  }
}
