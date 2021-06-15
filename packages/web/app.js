import Telegraf from 'telegraf'
import express from 'express'
import chalk from 'chalk'
import es6Renderer from 'express-es6-template-engine'
import { ServiceBroker } from 'moleculer'
import { telegramBotWebhookUrlFn, saveChat } from './util'
import sessionMiddleware from './middleware/session'
import commandArgsMiddleware from './middleware/commandArgs'
import chatLogger from './middleware/chat-logger'
import botCommands from './commands'

const greenTick = chalk.green('✓')
const redErrorTick = chalk.red('✗')
const {
  PORT,
  TELEGRAM_WEBHOOK_ENDPOINT,
  TELEGRAM_TOKEN
} = process.env
const app = express()
const bot = new Telegraf(TELEGRAM_TOKEN)
const broker = new ServiceBroker({
  logger: console,
  middlewares: [
    // Sets session data to be used by chat.incoming service
    sessionMiddleware
  ]
})
const services = [
  'chat',
  'db',
  'price',
  'sre',
  'mob',
  'session',
  'api',
  'quote',
  'rfq'
]

const dashboardApiService = broker.loadService(`${__dirname}/../../services/api-dashboard/api-dashboard.service.js`)
services.forEach(serviceName => {
  broker.loadService(`${__dirname}/../../services/${serviceName}/${serviceName}.service.js`)
})

broker.createService({
  name: 'web',
  actions: {
    pushBatch (ctx) {
      const { messages } = ctx.params
      messages.forEach(async ({ id, text }) => {
        await saveChat(id, text, true, broker)
        bot.telegram.sendMessage(id, text, { parse_mode: 'Markdown' })
          .catch(error => {
            ctx.broker.logger.error('error when pushing a message', error)
          })
      })
    },
    pushToIds (ctx) {
      const { ids, text } = ctx.params

      ids.forEach(async id => {
        await saveChat(id, text, true, broker)
        bot.telegram.sendMessage(id, text, { parse_mode: 'Markdown' })
          .catch(error => {
            ctx.broker.logger.error('error when pushing a message', error)
          })
      })
    }
  }
})

const { logger } = broker

const startServer = hostUrl => new Promise(async (resolve) => {
  app.engine('html', es6Renderer)
  app.set('views', `${__dirname}/views`)
  app.set('view engine', 'html')

  // TODO: Remove this way of accessing the dashboard api when deploying the services to seperate containers
  app.use('/dashboard-api', dashboardApiService.express())
  app.use((err, req, res, next) => {
    const errObject = {
      type: err.type || err.message,
      data: err.data || err.message,
      stack: err.stack
    }
    res.status(err.code).send(errObject)
  })

  app.get('/', (req, res) => {
    res.send('Thanks for your interest. It appears that you are not an existing client, please visit www.aixtrade.com')
  })

  const telegramWebhookUrl = telegramBotWebhookUrlFn(
    TELEGRAM_TOKEN,
    TELEGRAM_WEBHOOK_ENDPOINT,
    hostUrl
  )
  const callback = bot.webhookCallback(TELEGRAM_WEBHOOK_ENDPOINT)
  app.post(TELEGRAM_WEBHOOK_ENDPOINT, callback)

  const result = await bot.telegram.setWebhook(telegramWebhookUrl)
  if (result) {
    broker.logger.info(`${greenTick} webhook ${telegramWebhookUrl} registered`)
  } else {
    broker.logger.info(`webhook ${telegramWebhookUrl} fails with status ${result.status} ...`)
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info('listening on port ', PORT)
    resolve()
  })
})

const configureBot = () => {
  bot.use(commandArgsMiddleware())
  bot.use(chatLogger(broker))
  // Set all bot commands
  Object.entries(botCommands).forEach((command) => {
    bot.command(command[0], (ctx) => command[1](ctx, broker))
  })

  bot.on('text', async (ctx) => {
    const msgs = await broker.call('chat.incoming', {
      senderId: ctx.message.from.id,
      message: ctx.message.text
    })
    return msgs
  })
}

(async () => {
  let callbackHostUrl

  if (process.env.NODE_ENV === 'development') {
    if (process.env.TUNNEL_URL !== undefined) {
      callbackHostUrl = process.env.TUNNEL_URL
    } else if (process.argv[2]) {
      callbackHostUrl = process.argv[2]
    } else {
      logger.error(chalk.redBright(`${redErrorTick} In development mode you have to pass the tunnel variable. See Local setup section from README`))
      return
    }
  } else {
    callbackHostUrl = process.env.TELEGRAM_WEBHOOK_HOST_URL
  }

  configureBot()
  await broker.start()
  await startServer(callbackHostUrl)
  logger.info('                                             ')
  logger.info('---------------------------------------------')
  logger.info(chalk.greenBright(`open (cmd+clik) ${chalk.blue(callbackHostUrl)} to start`))
  logger.info(chalk.greenBright(`${greenTick} AiX Next is up and running`))
  logger.info('---------------------------------------------')
})()
