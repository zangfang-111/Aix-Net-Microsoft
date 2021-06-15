import request from 'request-promise'

const apiRoot = process.env.AIX_MARKET_DATA_API

/**
 * Calls the aix market api for the current trading info which refers to
 * the traded prices.
 * @param  {Array} fromSymbol Array of crypto coins to return the data for.
 * @param  {Array} toSymbol   Array of currencies in which to send the coin
 * traded prices.
 * @return {Object}           Response object from the api call
*/
export const getCurrentTradingInfo = async (fromSymbol, toSymbol) => {
  try {
    if (!fromSymbol) {
      return null
    }

    if (!toSymbol) {
      return null
    }

    let res = await request.get({
      uri: `${apiRoot}/marketdata/${fromSymbol}${toSymbol}`,
      json: true
    })

    res.fromSymbol = fromSymbol
    return res
  } catch (error) {
    throw new Error(`getCurrentTradingInfo error: ${error}`)
  }
}

export default {
  getCurrentTradingInfo
}
