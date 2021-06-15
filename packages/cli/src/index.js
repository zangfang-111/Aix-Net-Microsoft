import dotenv from 'dotenv-safe'
import path from 'path'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { ServiceBroker } from 'moleculer'
import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import imgcat from 'imgcat'
import sessionMiddleware from '../../web/middleware/session'
import { saveChat } from '../../../packages/web/util'

const botSays = (txt) => console.log(chalk.magenta(txt))

try {
  dotenv.config({
    path: path.join(__dirname, '/../../../.env'),
    allowEmptyValues: false
  })
} catch (error) {
  console.log(chalk.red('Error loading the configuration, make sure you run the command from the root directory of the repo.'))
  console.log('Error: ', error)
  process.exit(1)
}
const servicesPath = `${__dirname}/../../../services`

const serviceNames = [
  'chat',
  'db',
  'price',
  'sre',
  'mob',
  'session',
  'api',
  'quote'
]

class CliBot {
  async getTraders () {
    const tradersResults = []
    const traderDocuments = await this.broker.call('db.trader.findAll')
    traderDocuments.forEach((trader) => {
      tradersResults.push({
        name: [trader.telegramId, trader.firstName].join(',')
      })
    })
    return tradersResults
  }
  displayWelcomeMessage () {
    botSays('--------------------------------------')
    botSays('Hello, I\'m CLIBOT, type something    ')
    botSays(' and the 🤖 I\'ll answer in magenta   ')
    botSays(' To exit the program                  ')
    botSays(' press control + c two times          ')
    botSays('--------------------------------------')
  }
  async init (loggerEnabled) {
    this.broker = new ServiceBroker({
      logger: (loggerEnabled === true) ? console : false,
      middlewares: [
        sessionMiddleware
      ]
    })
    await Promise.all(serviceNames.map(async name => {
      await this.broker.loadService(`${servicesPath}/${name}/${name}.service.js`)
    }))
    await this.mockWebService()
    await this.broker.start()
    this.displayWelcomeMessage()
  }

  async dialog (msg) {
    if (msg !== '>') {
      const msgs = await this.broker.call('chat.incoming', {
        senderId: this.senderId,
        message: msg
      })

      msgs.forEach(async (line) => {
        if (line.imageUrl) {
          let image = await imgcat(line.imageUrl)
          console.log(image)
          botSays(line.text)
        } else {
          botSays(line.text)
        }
      })
    }
    const reply = await cli.prompt(msg)
    if (reply !== '\\q') {
      await this.dialog(reply)
    }
  }
  async run (traderId) {
    this.senderId = traderId
    await this.dialog('>')
    await this.broker.stop()
  }
  async mockWebService () {
    return this.broker.createService({
      name: 'web',
      actions: {
        async pushBatch (ctx) {
          const { messages } = ctx.params
          await Promise.all(messages.map(async ({ id, text, imageUrl }) => {
            await saveChat(id, text, true, this.broker)
            if (imageUrl) {
              let img = await imgcat(imageUrl)
              console.log(img)
              botSays(text)
            } else {
              botSays(text)
            }
          }))
        },
        async pushToIds (ctx) {
          const { ids, text } = ctx.params
          await Promise.all(ids.map(async id => {
            await saveChat(id, text, true, this.broker)
            botSays(`Message for ${id}: ${text}`)
          }))
        }
      }
    })
  }
}

class AixCliCommand extends Command {
  async run () {
    const { flags } = this.parse(AixCliCommand)
    const { logs } = flags
    const clibot = new CliBot()
    let telegramId
    await clibot.init(logs)
    if (!flags.telegramId) {
      cli.action.start('loading traders', { stdout: true })
      const traders = await clibot.getTraders()
      cli.action.stop()
      let selectedTrader = await inquirer.prompt([{
        name: 'trader',
        message: 'Select a trader',
        type: 'list',
        choices: traders
      }])
      telegramId = selectedTrader.trader.split(',')[0]
    } else {
      telegramId = flags.telegramId
    }
    await clibot.run(telegramId)
    process.exit(0)
  }
}

AixCliCommand.description = `CliBot
A CLI mock implementation of the AiX Telgram Webhook .
`
AixCliCommand.flags = {
  telegramId: flags.string({
    char: 't'
  }),
  logs: flags.boolean({
    char: 'l'
  })
}

module.exports = AixCliCommand
