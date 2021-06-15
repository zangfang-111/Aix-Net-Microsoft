export const sortOrders = orders => {
  return orders.sort(function (a, b) {
    if (a.security.replace('USD', '') < b.security.replace('USD', '')) return -1
    if (a.security.replace('USD', '') > b.security.replace('USD', '')) return 1
    if (a.side < b.side) return -1
    if (a.side > b.side) return 1
    if (a.price < b.price) return -1
    if (a.price > b.price) return 1
    return 0
  })
}
