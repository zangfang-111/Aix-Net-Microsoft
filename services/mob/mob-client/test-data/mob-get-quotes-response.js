const allOrders = [
  {
    order: {
      'id': '6f72646572-023de647-b236-4e46-b36c-df4357e45d73',
      'parentId': null,
      'symbol': 'BTCUSD',
      'price': 9500,
      'side': 'BUY',
      'quantity': 5,
      'originalQuantity': 3000,
      'liveQuantity': 3000,
      'executionQuantity': 0,
      'minimumQuantity': 3000,
      'displayQuantity': null,
      'quantityFractionBase': 1,
      'trader': '123456789',
      'orderType': 'Limit',
      'orderStatus': 'Open',
      'timeInForce': 'GTT',
      'userId': 'AIXTEST1',
      'broker': null,
      'clearingFirm': null,
      'rootReferenceNumber': '5BGKLG9NEZQ3C0',
      'referenceNumber': '5BGKLG9NEZQ3C0',
      'enteredAtInMillis': 1540983422709,
      'updatedAtInMillis': 1540983422709,
      'receivedAtInMillis': 1540983422751,
      'isQuote': true,
      'expireAtInMillis': null,
      'orderStatuses': 'Open'
    }
  },
  {
    order: {
      'id': '6f72646572-023de647-b236-4e46-b36c-df4357e45d73',
      'parentId': null,
      'symbol': 'BTCUSD',
      'price': 9500,
      'side': 'BUY',
      'quantity': 5,
      'originalQuantity': 3000,
      'liveQuantity': 3000,
      'executionQuantity': 0,
      'minimumQuantity': 3000,
      'displayQuantity': null,
      'quantityFractionBase': 1,
      'trader': '123456789',
      'orderType': 'Limit',
      'orderStatus': 'Open',
      'timeInForce': 'GTT',
      'userId': 'AIXTEST1',
      'broker': null,
      'clearingFirm': null,
      'rootReferenceNumber': '5BGKLG9NEZQ3C0',
      'referenceNumber': '5BGKLG9NEZQ3C0',
      'enteredAtInMillis': 1540983422709,
      'updatedAtInMillis': 1540983422709,
      'receivedAtInMillis': 1540983422751,
      'isQuote': true,
      'expireAtInMillis': null,
      'orderStatuses': 'Open'
    }
  },
  {
    order: {
      'id': '6f72646572-023de647-b236-4e46-b36c-df4357e45d73',
      'parentId': null,
      'symbol': 'BTCUSD',
      'price': 9500,
      'side': 'BUY',
      'quantity': 5,
      'originalQuantity': 3000,
      'liveQuantity': 3000,
      'executionQuantity': 0,
      'minimumQuantity': 3000,
      'displayQuantity': null,
      'quantityFractionBase': 1,
      'trader': '123456789',
      'orderType': 'Limit',
      'orderStatus': 'Open',
      'timeInForce': 'GTT',
      'userId': 'AIXTEST1',
      'broker': null,
      'clearingFirm': null,
      'rootReferenceNumber': '5BGKLG9NEZQ3C0',
      'referenceNumber': '5BGKLG9NEZQ3C0',
      'enteredAtInMillis': 1540983422709,
      'updatedAtInMillis': 1540983422709,
      'receivedAtInMillis': 1540983422751,
      'isQuote': false,
      'expireAtInMillis': null,
      'orderStatuses': 'Open'
    }
  }
]

const getQuotesResponse = (filters) => {
  const orders = allOrders.filter(item => {
    let check = true
    for (const [key, value] of Object.entries(filters)) {
      if (item.order[key] !== value) {
        check = false
        break
      }
    }
    return check
  })

  return ({
    _embedded: {
      orders
    },
    page: {
      size: 1
    }
  })
}

export default getQuotesResponse
