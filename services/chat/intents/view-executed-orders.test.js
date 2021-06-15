// eslint-disable-next-line
const debug = require('debug')('AiX:tests:sre:trade')

import {
  calculateDayTotal,
  calculateDayAverage
} from './view-executed-orders'

const executedOrders = [
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'BUY',
    price: 6500,
    quantity: 50,
    origQty: 50,
    liveQty: 0,
    execQty: 50
  },
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'BUY',
    price: 6700,
    quantity: 50,
    origQty: 50,
    liveQty: 0,
    execQty: 50
  },
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'BUY',
    price: 6900,
    quantity: 50,
    origQty: 50,
    liveQty: 0,
    execQty: 50
  },
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'SELL',
    price: 7000,
    quantity: 25,
    origQty: 25,
    liveQty: 0,
    execQty: 25
  },
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'SELL',
    price: 7100,
    quantity: 25,
    origQty: 25,
    liveQty: 0,
    execQty: 25
  },
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'SELL',
    price: 7200,
    quantity: 25,
    origQty: 25,
    liveQty: 0,
    execQty: 25
  },
  {
    security: 'BTCUSD',
    status: 'Executed',
    side: 'SELL',
    price: 7300,
    quantity: 25,
    origQty: 25,
    liveQty: 0,
    execQty: 25
  }
]

describe('Day Average Calculator', () => {
  test('calculateDayTotal() shold work for orders in multiple securities and both directions', () => {
    const dayTotal = calculateDayTotal(executedOrders)

    expect(typeof dayTotal).toBe('object')
    expect(Object.keys(dayTotal).length).toBe(1)
    expect(dayTotal['BTCUSD'].buyExecutedQuantity).toBe(150)
    expect(dayTotal['BTCUSD'].buyTotalExecutedPrice).toBe(1005000)
    expect(dayTotal['BTCUSD'].sellExecutedQuantity).toBe(100)
    expect(dayTotal['BTCUSD'].sellTotalExecutedPrice).toBe(715000)
  })

  test('calculateDayAverage() - Should work as expected', () => {
    const dayTotal = calculateDayTotal(executedOrders)
    const btcDayTotal = dayTotal['BTCUSD']

    const dayAverage = calculateDayAverage(btcDayTotal.buyExecutedQuantity, btcDayTotal.buyTotalExecutedPrice, btcDayTotal.sellExecutedQuantity, btcDayTotal.sellTotalExecutedPrice)

    expect(typeof dayAverage).toBe('object')
    expect(dayAverage.avgBuyPrice).toBe(6700)
    expect(dayAverage.avgSellPrice).toBe(7150)
    expect(dayAverage.netPositionVolume).toBe(50)
    expect(dayAverage.netExecutedPrice).toBe(5800)
  })
})
