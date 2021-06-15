module.exports = {
  quoteWithBothSidesDegraded: {
    'bid': 'degraded',
    'offer': 'degraded',
    'reason': 'order cancellation',
    'quote': {
      'quoteId': 1303932146,
      'quoteRequestId': 579503008,
      'symbol': 'BTCUSD',
      'quantity': 1500,
      'status': 'Open',
      'bid': {
        'price': 4212.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4212.25
          }
        ]
      },
      'offer': {
        'price': 4315.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4315.25
          }
        ]
      }
    }
  },
  quoteWithDegradedBid: {
    'bid': 'degraded',
    'offer': 'unchanged',
    'reason': 'order cancellation',
    'quote': {
      'quoteId': 1303932146,
      'quoteRequestId': 579503008,
      'symbol': 'BTCUSD',
      'quantity': 2500,
      'status': 'Open',
      'bid': {
        'price': 4212.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4212.25
          }
        ]
      },
      'offer': {
        'price': 4315.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4315.25
          }
        ]
      }
    }
  },
  quoteWithDegradedOffer: {
    'bid': 'unchanged',
    'offer': 'degraded',
    'reason': 'order cancellation',
    'quote': {
      'quoteId': 1303932146,
      'quoteRequestId': 579503008,
      'symbol': 'BTCUSD',
      'quantity': 3500,
      'status': 'Open',
      'bid': {
        'price': 4212.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4212.25
          }
        ]
      },
      'offer': {
        'price': 4315.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4315.25
          }
        ]
      }
    }
  },
  quoteWithInvalid2WayQuote: {
    'bid': 'degraded',
    'offer': 'degraded',
    'reason': 'order cancellation',
    'quote': {
      'quoteId': 1303932146,
      'quoteRequestId': 579503008,
      'symbol': 'BTCUSD',
      'quantity': 4500,
      'status': 'Open',
      'bid': {
        'price': null,
        'aggregated': false,
        'orders': [
        ]
      },
      'offer': {
        'price': 4315.25,
        'aggregated': false,
        'orders': [
          {
            'id': '6f72646572-3d5af534-1047-48f8-8b92-3ed5e14a205f',
            'price': 4315.25
          }
        ]
      }
    }
  }
}
