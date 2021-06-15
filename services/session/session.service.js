import redis from 'redis'
const redisMock = require('redis-mock')
import { promisify } from 'util'
import { SESSION_TIMEOUT } from './constants'
import actions from './actions'
// eslint-disable-next-line
const debug = require('debug')('AiX:session')

let client
let subscriber
let broker

if (process.env.NODE_ENV === 'unit_test') {
  client = redisMock.createClient()
  subscriber = redisMock.createClient()
} else {
  client = redis.createClient(process.env.REDIS_URL)
  // We can't use the same Redis instance as subscriber and publisher
  subscriber = redis.createClient(process.env.REDIS_URL)
}

client.on('ready', () => {
  subscriber.subscribe('__keyevent@0__:expired')
})

subscriber.on('message', async (channel, message) => {
  broker.logger.info('< REDIS Message >')
  broker.logger.info(channel)
  broker.logger.info(message)

  // Handle for now onoly expired key events
  if (channel === '__keyevent@0__:expired') {
    const telegramId = message.split('_')[0]
    if (message.split('_')[2] === 'SESSION') {
      broker.broadcast('session.expired', { userId: telegramId })
    }
  }
})

client.on('error', function (error) {
  debug('Redis Client Error')
  debug(error.stack)
})

subscriber.on('error', function (error) {
  debug('Redis Subscriber Client Error')
  debug(error.stack)
})

export const redisClient = {
  get: promisify(client.get).bind(client),
  hkeys: promisify(client.hkeys).bind(client),
  hset: promisify(client.hset).bind(client),
  hmset: promisify(client.hmset).bind(client),
  hgetall: promisify(client.hgetall).bind(client),
  hdel: promisify(client.hdel).bind(client),
  set: promisify(client.set).bind(client),
  setex: promisify(client.setex).bind(client),
  delete: promisify(client.del).bind(client)
}

async function set (key, value) {
  let jsonValue = JSON.stringify(value)
  return redisClient.set(key, jsonValue)
}

async function setex (key, value) {
  let jsonValue = JSON.stringify(value)
  return redisClient.setex(key, SESSION_TIMEOUT, jsonValue)
}

async function get (key) {
  const value = await redisClient.get(key)
  try {
    return JSON.parse(value)
  } catch (error) {
    debug('Error Get session')
    debug(error)
  }
}

async function deleteKey (key) {
  return redisClient.delete(key)
}

const getSessionKey = (telegramId) => {
  return `${telegramId}_SRE_SESSION_ID`
}

const service = {
  name: 'session',
  actions: {
    ...actions,
    async set (ctx) {
      broker = ctx.broker
      const { key, value } = ctx.params
      await setex(key, value)
    },
    async setWithoutTimeout (ctx) {
      broker = ctx.broker
      const { key, value } = ctx.params
      await set(key, value)
    },
    async get (ctx) {
      broker = ctx.broker
      const { key } = ctx.params
      return get(key)
    },
    async delete (ctx) {
      const { key } = ctx.params
      return deleteKey(key)
    },
    async clearUserSession (ctx) {
      const { userId } = ctx.params
      return deleteKey(getSessionKey(userId))
    }
  }
}

module.exports = service
