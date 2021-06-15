// Quote Request Constants
export const INACTION_REMINDER_TIMEOUT = 30

export const MIN_ACCEPTED_VOLUME = 0.000001
export const MAX_ACCEPTED_VOLUME = 99999999

export const RFQ_DISPLAY_LIMIT = 3

export const getSessionKey = (telegramId) => {
  return `${telegramId}_SRE_SESSION_ID`
}

export const TWOWAY_ORDER = {
  ONE: 'T',
  TWO_FILL: 'A',
  TWO_PARTIAL: 'B'
}
