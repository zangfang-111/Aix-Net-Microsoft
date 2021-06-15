import ApiService, { Errors as E } from 'moleculer-web'
import jwt from 'jsonwebtoken'
import actions from './actions/index'
import IO from 'socket.io'

const checkToken = function (req, res, next) {
  let token
  if (req.headers.authorization) {
    const type = req.headers.authorization.split(' ')[0]
    if (type === 'Bearer') { token = req.headers.authorization.split(' ')[1] }
  }

  if (!token) {
    return next(new E.UnAuthorizedError(E.ERR_NO_TOKEN))
  }
  try {
    jwt.verify(token, this.settings.JWT_SECRET)
  } catch (e) {
    return next(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN))
  }
  return next()
}

module.exports = {
  name: 'dashboardApi',
  mixins: [ApiService],

  settings: {
    port: 9000,
    JWT_SECRET: process.env.DASHBOARD_API_SECRET,
    cors: {
      origin: '*',
      methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: '*',
      credentials: true,
      maxAge: null
    },
    routes: [
      {
        aliases: {
          // admins
          'GET admins/:email': [
            checkToken,
            'dashboardApi.admin.get'
          ],
          'POST admins': [
            checkToken,
            'dashboardApi.admin.create'
          ],

          // auth
          'POST auth/login': 'dashboardApi.auth.login',

          // traders
          'POST traders': [
            checkToken,
            'dashboardApi.trader.create'
          ],
          'GET traders': [
            checkToken,
            'dashboardApi.trader.get'
          ],
          'GET traders/:id': [
            checkToken,
            'dashboardApi.trader.getById'
          ],
          'GET traders/telegram/:id': [
            checkToken,
            'dashboardApi.trader.getByTelegramId'
          ],
          'PUT traders/:id': [
            checkToken,
            'dashboardApi.trader.update'
          ],
          'DELETE traders/:id': [
            checkToken,
            'dashboardApi.trader.delete'
          ],

          // quote requests
          'GET quote-requests': [
            checkToken,
            'dashboardApi.quoteRequest.get'
          ],
          'GET quote-requests/:id': [
            checkToken,
            'dashboardApi.quoteRequest.getById'
          ],
          'DELETE quote-requests/:id': [
            checkToken,
            'dashboardApi.quoteRequest.delete'

          ],

          'GET financial-instruments': [
            checkToken,
            'dashboardApi.financial-instrument.get'

          ]
        },
        bodyParsers: {
          json: {
            strict: false
          },
          urlencoded: {
            extended: false
          }
        }
      }
    ]
  },

  events: {
    /*
    example of subscribing to all events and emitting a lot of them
    '**' (payload, sender, event) {
      if (this.io) {
        this.io.emit('event', {
          sender,
          event,
          payload
        })
      }
    }
    */
  },

  actions: {
    ...actions
  },

  started () {
    this.io = IO.listen(this.server)
    this.io.on('connection', client => {
      this.logger.info('Client connected via websocket!')

      client.on('call', ({ action, params, opts }, done) => {
        this.logger.info('Received request from client! Action:', action, ', Params:', params)

        this.broker.call(action, params, opts)
          .then(res => {
            if (done) { done(res) }
          })
          .catch(err => this.logger.error(err))
      })

      client.on('disconnect', () => {
        this.logger.info('Client disconnected')
      })
    })
  }
}
