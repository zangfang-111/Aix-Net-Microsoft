import { newCommand } from './new'
import { myOrdersCommand } from './my-orders'
import { allOrdersCommand } from './all-orders'
import { getPriceCommand } from './get-price'
import { marketPriceCommand } from './market-price'
import { bugCommand } from './bug'
import { cancelOrdersCommand } from './cancel-orders'
import { activeRfqsCommand } from './active-rfqs'
import { openRfqsCommand } from './open-rfqs'

export default {
  'new': newCommand,
  'allorders': allOrdersCommand,
  'myorders': myOrdersCommand,
  'getprice': getPriceCommand,
  'price': marketPriceCommand,
  'bug': bugCommand,
  'cancel': cancelOrdersCommand,
  'active': activeRfqsCommand,
  'quotes': openRfqsCommand
}
