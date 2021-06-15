module.exports = {
  quoteWithValid2WayQuote: {
    'quoteRequestId': 1013631021,
    'symbol': 'BTCUSD',
    'quantity': 6000,
    'trader': '483685448',
    'status': 'Open',
    'spotPrice': 3757.049638750000,
    'expiresAt': '2019-01-04 16:30:44',
    'latestQuote': {
      'quoteId': 338416227,
      'quoteRequestId': 1013631021,
      'symbol': 'BTCUSD',
      'quantity': 6000,
      'status': 'Open',
      'bid': {
        'price': 4212.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-6ef52d9a-ed6d-46d6-8f32-5d8d69416876',
            'price': 4212.25,
            'status': 'Open'
          }
        ]
      },
      'offer': {
        'price': 4315.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-6ef52d9a-ed6d-46d6-8f32-5d8d69416876',
            'price': 4315.25,
            'status': 'Open'
          }
        ]
      }
    }
  },
  quoteWithInvalid2WayQuote: {
    'quoteRequestId': 1013631021,
    'symbol': 'BTCUSD',
    'quantity': 6000,
    'trader': '483685448',
    'status': 'Open',
    'spotPrice': 3757.049638750000,
    'expiresAt': '2019-01-04 16:30:44',
    'latestQuote': {
      'quoteId': 338416227,
      'quoteRequestId': 1013631021,
      'symbol': 'BTCUSD',
      'quantity': 6000,
      'status': 'Open',
      'bid': {
        'price': 4212.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-6ef52d9a-ed6d-46d6-8f32-5d8d69416876',
            'price': 4212.25,
            'status': 'Open'
          }
        ]
      },
      'offer': {
        'price': null,
        'aggregated': false,
        'orders': [
        ]
      }
    }
  }
}
