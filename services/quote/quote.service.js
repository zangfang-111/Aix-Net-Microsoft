import actions from './actions'
import { QuoteClient } from './quote-wrapper/quote-client-wrapper'

module.exports = {
  name: 'quote',
  created () {
    this.quoteClient = new QuoteClient(this.broker)
  },

  actions: {
    ...actions
  }
}
