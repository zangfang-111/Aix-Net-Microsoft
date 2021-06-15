export const ETHUSD = 'ETHUSD'
export const BTCUSD = 'BTCUSD'
export const XRPUSD = 'XRPUSD'
export const LTCUSD = 'LTCUSD'

export const MARKET_INSTRUMENTS = {
  'ETH': ETHUSD,
  'BTC': BTCUSD,
  'XRP': XRPUSD,
  'LTC': LTCUSD
}

export const ORDERS_STATUSES = {
  PENDING: 'Pending',
  OPEN: 'Open',
  WAITING: 'Waiting',
  REJECTED: 'Rejected',
  CANCELED: 'Canceled',
  EXECUTED: 'Executed',
  EXPIRED: 'Expired',
  PENDINGCANCEL: 'PendingCancel',
  PENDINGREPLACE: 'PendingReplace',
  PENDINGEXPIRE: 'PendingExpire',
  PENDINGREJECT: 'PendingReject',
  RISKREJECTED: 'RiskRejected',
  PENDINGRISKREJECT: 'PendingRiskReject'
}

export const MAX_ACCCEPTED_SOFT_THRESHOLD_PRICE_DEVIATION_PERC = 0.025 // 2.5%
export const MAX_ACCCEPTED_HARD_THRESHOLD_PRICE_DEVIATION_PERC = 0.15 // 15%
export const EXPIRE_IN_MILLIS = 43200000 // 12 hours
export const EXPIRE_IN_MILLIS_QUOTE = 1800000 // 30 minutes
