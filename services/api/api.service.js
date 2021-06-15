import Routes from './routes'
import actions from './actions'
import bcrypt from 'bcrypt'
import ApiService, { Errors as E } from 'moleculer-web'
const { ServiceNotFoundError } = require('moleculer').Errors

module.exports = {
  name: 'api',
  mixins: [ApiService],
  settings: {
    routes: [{
      authorization: true,
      aliases: Routes
    }],
    port: 4000
  },
  methods: {
    async authorize (ctx, routes, req, res) {
      const auth = req.headers.authorization
      if (!auth) {
        return Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN))
      }
      const decodedString = Buffer.from(auth.slice(6), 'base64').toString()
      const decodedArr = decodedString.split(':')
      const password = decodedArr[1]

      let user = await ctx.broker.call('db.user.get', decodedArr[0])
      if (!user) {
        const error = 'Can not find this user'
        throw new ServiceNotFoundError(error, 404, 'ERR_SOMETHING')
      }

      const match = await bcrypt.compare(password, user.password)
      if (match) {
        return Promise.resolve(ctx)
      } else {
        return Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN))
      }
    }
  },
  actions: {
    hello (ctx) {
      console.log(ctx.meta.user)
      return 'hello'
    },
    ...actions
  }
}
