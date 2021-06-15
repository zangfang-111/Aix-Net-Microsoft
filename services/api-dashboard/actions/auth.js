const { MoleculerClientError } = require('moleculer').Errors
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export default {
  /**
* @apiName  POST dashboard-api/auth/login
*
* @apiParam {Object} Admin to be logged in
*
* @apiSuccess {String} password Admin's hashed password.
* @apiSuccess {String} email Admin's email.
* @apiSuccess {Date} createdAt Admin's created at date.
* @apiSuccess {Date} updatedAt Admin's last updated date.
* @apiSuccess {String} Generated JWT.

* @apiError 400 Email or password is invalid!
*/
  login: {
    params: {
      email: { type: 'email' },
      password: { type: 'string' }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        const { password } = ctx.params
        const admin = await ctx.broker.call('db.admin.getByEmail', ctx.params)
        if (!admin) {
          throw new MoleculerClientError('Email or password is invalid!', 400)
        }
        const samePass = await bcrypt.compare(password, admin.password)
        if (!samePass) {
          throw new MoleculerClientError('Email or password is invalid!', 400)
        }
        const today = new Date()
        const exp = new Date(today)
        exp.setDate(today.getDate() + 60)

        const token = jwt.sign({
          id: admin._id,
          exp: Math.floor(exp.getTime() / 1000)
        }, process.env.API_SECRET)

        return { admin, token }
      } catch (e) {
        throw e
      }
    }
  }
}
