const sreEngine = require('aix-sre')
import chalk from 'chalk'
const greenTick = chalk.green('✓')
const redErrorTick = chalk.red('✗')

sreEngine.init(function (err, result) {
  if (err) {
    console.log(`${redErrorTick} SRE Service init error ` + err)
    return
  }
  console.log(`${greenTick} SRE Service init successful. Version Id: ${result.versionId}`)
})

module.exports = {
  name: 'sre',
  actions: {
    async send (ctx) {
      return new Promise((resolve, reject) => {
        sreEngine.send(ctx.params.toSRE, function (err, response) {
          if (err) {
            ctx.broker.logger.info('< SRE Error > ', err)
            return reject(err)
          }
          ctx.broker.logger.info('< SRE > ', response)
          return resolve(response)
        })
      })
    }
  }
}
