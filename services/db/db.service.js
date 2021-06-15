import mongoose from './mongoose'
import actions from './actions'
import events from './events'

if (process.env.NODE_ENV === 'unit_test') {
  mongoose.connect(process.env.UNIT_TEST_MONGODB_URI, { useNewUrlParser: true })
} else {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
}

module.exports = {
  // transporter: {
  //   type: 'MQTT',
  //   options: process.env.ACTIVE_MQ_HOST,
  // },
  name: 'db',
  actions: {

    insert (ctx) {
      ctx.broker.logger.info('doc:', ctx.params.document)
    },
    showMe (ctx) {
      ctx.broker.logger.info('doc:', ctx.params.document)
    },
    ...actions
  },
  events,
  async stopped () {
    mongoose.connection.close()
  }
}
