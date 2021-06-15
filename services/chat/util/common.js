export const createMsg = (text, contextParams = null, buttons = null) => (
  {
    text,
    contextParams,
    buttons
  }
)

// format seconds into M:SS (ex 1:43)
export const fmtMSS = (s) => (
  (s - (s %= 60)) / 60 + (s > 9 ? ':' : ':0') + s
)

// return time left until quote expires
export const timeLeft = (expireAt) => {
  expireAt.setMinutes(expireAt.getMinutes() + 2)
  const seconds = Math.floor((expireAt - Date.now()) / 1000)
  return fmtMSS(seconds)
}
