import { Markup } from 'telegraf'
export const telegramBotWebhookUrlFn = (botAuthToken, botWebhookEndpoint, localUrl) => {
  let url = `https://api.telegram.org/bot${botAuthToken}/setWebhook`
  url += `?url=${localUrl}${botWebhookEndpoint}`
  return url
}
/* eslint-disable */
const callback_data = 'callback_data'
export const sortOrders = orders => {
  return orders.sort(function (a, b) {
    if (a.security.replace('USD', '') < b.security.replace('USD', '')) return -1
    if (a.security.replace('USD', '') > b.security.replace('USD', '')) return 1
    if (a.side < b.side) return -1
    if (a.side > b.side) return 1
    if (a.price < b.price) return -1
    if (a.price > b.price) return 1
    return 0
  })
}

export const getSession = async (params, broker) => {
  return broker.call('session.get', { key: `${params.senderId}_SRE_SESSION_ID` })
}

export const saveChat = async (id, text, isBot, broker) => {
  const sessionId = await getSession({ senderId: id, text }, broker)
  broker.call('db.chat.create', {
    sessionId: sessionId,
    senderId: id,
    message: text,
    isBotMessage: isBot
  })
}

export const replyWithMsg = async (senderId, msg, isBot, ctx, broker) => {
  if (!msg) {
    broker.logger.error('replyWithMsg - Message is undefined')
    return null
  }

  if (msg.text) {
    await saveChat(senderId, msg.text, isBot, broker)
    if (msg.buttons) {
      let buttons = []
      Object.keys(msg.buttons).map(
        key => {
          buttons.push(Markup.callbackButton(`${msg.buttons[key].label}`, callback_data))
        }
      )
      await ctx.reply(
        msg.text,
        Markup.inlineKeyboard(buttons).extra()
      )
    } else {
      await ctx.reply(msg.text)
    }
  }
  if (msg.imageUrl) {
    await saveChat(senderId, msg.imageUrl, isBot, broker)

    const options = {}
    if (msg.caption) {
      options.caption = msg.caption
    }

    await ctx.replyWithPhoto(msg.imageUrl, options)
  }
}

export const delayTime = time => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export default {
  telegramBotWebhookUrlFn,
  getSession,
  saveChat,
  sortOrders,
  replyWithMsg
}
