module.exports = {
  'quoteRequest': {
    'quoteRequestId': 1532718162,
    'symbol': 'BTCUSD',
    'quantity': 6000,
    'trader': '12312312',
    'status': 'Open',
    'spotPrice': 3742.325449,
    'expiresAt': '2018-12-27 17:22:54',
    'latestQuote': {
      'quoteId': 624158912,
      'quoteRequestId': 1532718162,
      'symbol': 'BTCUSD',
      'quantity': 6000,
      'status': 'Open',
      'bid': {
        'price': 3800,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-babb9bef-786c-4424-84ac-ff6c45b3fb99',
            'price': 3800,
            'status': 'Open'
          }
        ]
      },
      'offer': {
        'price': 3899,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-889820a5-dfe2-4660-a748-73a1baf247d4',
            'price': 3899,
            'status': 'Open'
          }
        ]
      }
    }
  },
  '_links': {
    'GET': [
      {
        'href': 'http://qa-quote-service.cfapps.io/quote/1532718162/stream'
      },
      {
        'href': 'http://qa-quote-service.cfapps.io/quote/request/1532718162/stream'
      }
    ]
  }
}
