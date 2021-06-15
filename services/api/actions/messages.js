/**
 * @api {get} messages/:traderId Get chat messages
 * @apiName GET Chat Messages
 * @apiGroup RainBird
 *
 * @apiHeader {String} Authorization base64 token, type: "Basic token", eg: "Basic dGVzdEB0ZXN0LmNvbTp0ZXN0MTIz"
 *
 * @apiParam {Number} traderId Trader's telegram Id, (required parameter), eg: 582703972.
 * @apiParam {Date} toDate You can see messages of until before toDate, (required parameter), eg: 2018-11-20.
 * @apiParam {Number} page Page count(s), eg: 1.
 * @apiParam {Number} limit You want messages number, eg: 20.
 *
 * @apiSuccess {Number} count Return messages count.
 * @apiSuccess {Array} data  Response messages data.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "count": 2,
 *         "data": [
 *           {
 *             "sessionId": null,
 *             "senderId": "582703972",
 *             "message": "/allorders",
 *             "isBotMessage": false,
 *             "createdAt": "2018-11-12T17:07:41.572Z",
 *             "updatedAt": "2018-11-12T17:07:41.572Z"
 *           },
 *           {
 *             "sessionId": null,
 *             "senderId": "582703972",
 *             "message": "Hi Zang! Here are all your orders:",
 *             "isBotMessage": true,
 *             "createdAt": "2018-11-12T17:07:43.421Z",
 *             "updatedAt": "2018-11-12T17:07:43.421Z"
 *           }
 *        ]
 *     }
 *
 * @apiError UserNotFound The id of the User was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *         "name": "ServiceNotFoundError",
 *         "message": "Service 'messages.get' is not found.",
 *         "code": 404,
 *         "type": "SERVICE_NOT_FOUND",
 *         "data": {
 *           "action": "messages.get"
 *         }
 *     }
 */
const { ServiceNotFoundError, ValidationError } = require('moleculer').Errors

export default {
  async get (ctx) {
    const page = parseInt(ctx.params.page, 10)
    const limit = parseInt(ctx.params.limit, 10)
    let traderStatus = await ctx.broker.call('db.trader.get', ctx.params)
    if (!traderStatus) {
      const error = `Does not exist ${ctx.params.traderId} trader`
      throw new ServiceNotFoundError(error, 404, 'ERR_SOMETHING')
    }
    let regEx = /^\d{4}-\d{2}-\d{2}$/
    let d = new Date(ctx.params.toDate)
    if (!ctx.params.toDate.match(regEx) ||
      Number.isNaN(d.getTime()) ||
      !Number.isInteger(page) ||
      !Number.isInteger(limit)
    ) {
      const error = 'Please enter correct date format, YYYY-MM-DD'
      throw new ValidationError(error, 422, 'ERR_SOMETHING')
    } else {
      return ctx.broker.call('db.chat.get', ctx.params)
    }
  }
}
