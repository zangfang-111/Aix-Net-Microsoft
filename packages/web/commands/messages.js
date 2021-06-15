const messages = {
  newSession: `New session started`,
  noOrder: [
    username => `${username}, it seems you don't have any orders. If you want to work any just let me know by saying something like:`,
    `Please work a 7000 bid for 10 btc`,
    `offer 7500 for 20 eth`
  ],
  firstMessage: username => `Hi ${username}! We are working on following:`,
  price: {
    missing: `Please provide both security and volume`,
    created: res => `Your quote request ${res} is created. You will be notified for any incoming quotes.`,
    error: `Sorry, your quote request couldn't be created`
  },
  format: {
    BUY: 'Bid',
    SELL: 'Offer'
  },
  generalErrorMessage: `Oups. Something went wrong. Please try again`,
  orderMessage: order => order.side === 'BUY'
    ? `${messages.format[order.side]} $${order.price} for ${order.quantity} ${order.security}`
    : `${messages.format[order.side]} ${order.quantity} ${order.security} at $${order.price}`
}

export default messages
