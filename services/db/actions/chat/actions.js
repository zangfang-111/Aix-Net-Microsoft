import Chat from './model'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_LIMIT = 30

export default {
  async create (ctx) {
    const newChat = new Chat({
      sessionId: ctx.params.sessionId,
      senderId: ctx.params.senderId,
      message: ctx.params.message,
      isBotMessage: ctx.params.isBotMessage
    })

    const data = await newChat.save()

    return data.view()
  },
  async getChatMessage (ctx) {
    let { traderId, toDate, page, limit } = ctx.params

    toDate = new Date(ctx.params.toDate)
    page = (isNaN(page) || parseInt(page) < 1) ? DEFAULT_PAGE : parseInt(page)
    limit = (isNaN(limit) || parseInt(limit) < 1) ? DEFAULT_PAGE_LIMIT : parseInt(limit)

    const query = {
      senderId: traderId
    }
    if (toDate !== 'Invalid Date') {
      query.createdAt = {
        $gte: toDate
      }
    }
    const res = await Chat.find(query, { _id: 0, __v: 0 })
      .sort({ createdAt: 'desc' })
      .skip((page - 1) * limit)
      .limit(limit)

    return { count: res.length, data: res.reverse() }
  }
}
