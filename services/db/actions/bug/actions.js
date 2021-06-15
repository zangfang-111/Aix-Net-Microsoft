import Bug from './model'
import { createJiraIssue, addJsonAttachmentToJiraIssue } from '../../../chat/lib/external/JiraClient'

export default {
  async create (ctx) {
    let params = ctx.params
    const newBug = new Bug({
      bug_description: params.message.text,
      session: params.sreSessionId,
      user_telegram_id: params.message.from.id
    })
    await newBug.save()

    try {
      const trader = await ctx.broker.call('db.trader.show', {
        telegramId: params.message.from.id
      })

      if (process.env.JIRA_BUG_REPORTING_ENABLED) {
        let {
          firstName,
          lastName,
          email,
          telegramId
        } = trader

        var toDate = await new Date()
        toDate.setDate(toDate.getDate() - 1)
        toDate = toDate.toISOString().slice(0, 10)
        const botMessages = await ctx.broker.call('db.chat.get', {
          traderId: telegramId,
          toDate: toDate,
          page: 1,
          limit: 20
        })

        let issue = await createJiraIssue(firstName, lastName, email, telegramId, params.message.text, botMessages.data)
        if (issue && botMessages) {
          await addJsonAttachmentToJiraIssue(issue, botMessages, 'botConversation')
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
