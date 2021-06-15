/**
 * @api {get} trader/:traderId Get trader
 * @apiName GET trader
 * @apiGroup RainBird
 *
 * @apiHeader {String} Authorization base64 token, type: "Basic token", eg: "Basic dGVzdEB0ZXN0LmNvbTp0ZXN0MTIz"
 *
 * @apiParam {Number} traderId Trader's telegram Id, (required parameter), eg: 582703972.
 *
 * @apiSuccess {Array} financialInstrumentsInUse Financial instruments in use.
 * @apiSuccess {Array} telegramId  Trader's telebram ID.
 * @apiSuccess {String} mobileNumber Trader's mobileNumber.
 * @apiSuccess {String} firstName Trader's firstName.
 * @apiSuccess {String} lastName Trader's lastName.
 * @apiSuccess {String} email Trader's email.
 * @apiSuccess {String} traderType Trader's type.
 * @apiSuccess {Array} wallet Trader's Wallet.
 * @apiSuccess {String} createdAt Trader's createdAt.
 * @apiSuccess {String} updatedAt Trader's updatedAt.
 * @apiSuccess {String} id Trader's DB ID.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "financialInstrumentsInUse": [],
 *        "telegramId": "582703972",
 *        "mobileNumber": "18640811215",
 *        "firstName": "Zang",
 *        "lastName": "Fang",
 *        "email": "checken.developer114@gmail.com",
 *        "traderType": "MARKET_MAKER",
 *        "wallet": [
 *          {
 *            "_id": "5bdaeebc289c8a240fdeb291",
 *            "currency": "BTC",
 *            "address": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
 *          },
 *          {
 *            "_id": "5bdaeebc289c8a240fdeb290",
 *            "currency": "ETH",
 *            "address": "0x123f681646d4a755815f9cb19e1acc8565a0c2ac"
 *          }
 *        ],
 *        "createdAt": "2018-11-01T12:17:00.420Z",
 *        "updatedAt": "2018-11-01T12:17:00.420Z",
 *        "id": "5bdaeebc289c8a240fdeb28e"
 *    }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *        "name": "ServiceNotFoundError",
 *         "message": "Service 'trader.583709372' is not found.",
 *         "code": 404,
 *         "type": "SERVICE_NOT_FOUND",
 *         "data": {
 *           "action": "trader.583709372"
 *         }
 *     }
 */
const { ServiceNotFoundError } = require('moleculer').Errors

export default {
  async get (ctx) {
    let traderStatus = await ctx.broker.call('db.trader.get', ctx.params)
    if (!traderStatus) {
      const error = `Does not exist ${ctx.params.traderId} trader`
      throw new ServiceNotFoundError(error, 404, 'ERR_SOMETHING')
    }
    return traderStatus
  }
}
