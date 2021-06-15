const { MoleculerClientError } = require('moleculer').Errors

export default {
  /**
 * @apiName  GET dashboard-api/admins/:email
 *
 * @apiHeader {String} Authorization token based, type: "JWT"
 *
 * @apiParam {String} Admin's email which you want to get, eg: test@gmail.com.
 *
 * @apiSuccess {String} password Admin's hashed password.
 * @apiSuccess {String} email Admin's email.
 * @apiSuccess {Date} createdAt Admin's created at date.
 * @apiSuccess {Date} updatedAt Admin's last updated date.
 *
 * @apiError 401 Unauthorized
 * @apiError 404 Not Found
 */
  get: {
    params: {
      email: { type: 'email' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        let dashboardAdmin = await ctx.broker.call('db.admin.getByEmail', ctx.params.email)
        if (!dashboardAdmin) {
          throw new MoleculerClientError(`Not Found`, 404)
        }
        return dashboardAdmin
      } catch (e) {
        throw e
      }
    }
  },
  /**
* @apiName  POST dashboard-api/admins
*
* @apiHeader {String} Authorization token based, type: "JWT"
*
* @apiParam {Object} Admin object to be created
*
* @apiSuccess {String} password Admin's hashed password.
* @apiSuccess {String} email Admin's email.
* @apiSuccess {Date} createdAt Admin's created at date.
* @apiSuccess {Date} updatedAt Admin's last updated date.

* @apiError 401 Unauthorized
* @apiError 400 Failed to create new entity
* @apiError 400 Please use a different email
*/
  create: {
    params: {
      email: { type: 'email' },
      password: { type: 'string', min: 6 }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        let dashboardAdmin = await ctx.broker.call('db.admin.create', ctx.params)
        if (!dashboardAdmin) {
          throw new MoleculerClientError(`Failed to create new entity`, 400)
        }
        return dashboardAdmin
      } catch (e) {
        if (e.code === 11000 && e.name === 'MongoError') {
          throw new MoleculerClientError('Please use a different email', 400)
        }
        throw e
      }
    }
  }

}
