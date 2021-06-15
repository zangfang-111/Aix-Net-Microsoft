let request = require('request-promise')
let jira = {
  jiraUrl: process.env.JIRA_URL,
  jiraAuth: process.env.JIRA_AUTH_TOKEN,
  projectId: process.env.JIRA_PROJECT_ID,
  issueTypeId: process.env.JIRA_ISSUE_TYPE_ID
}

const jiraIssueDescription = ({
  completeBugDescription,
  firstName,
  lastName,
  email,
  telegramId
}) => {
  return `${completeBugDescription} \n\n` +
          `Reporter info : \n` +
          ` First name : ${firstName} \n` +
          ` Last name : ${lastName} \n` +
          ` Email : ${email} \n` +
          ` Telegram ID : ${telegramId}`
}

export async function createJiraIssue (firstName, lastName, email, telegramId, bugDescription, botMessages = null) {
  let bugSummary = '[BUG][AiX Next]' + bugDescription.substring(4, 254)
  var completeBugDescription = bugDescription
  var botMessagesConversation = ''

  if (botMessages) {
    botMessagesConversation = '> Conversation Start\n'
    botMessages.map((msg) => {
      botMessagesConversation += ((msg.isBotMessage) ? `AiX: ` : `Trader: `) + msg.message + `\n`
    })
    botMessagesConversation += '> Conversation End'
    completeBugDescription += `\n\n\n` + botMessagesConversation + `\n\n\n`
  }

  let options = {
    method: 'POST',
    url: `${jira.jiraUrl}/issue`,
    headers:
    {
      'Authorization': 'Basic ' + jira.jiraAuth,
      'Content-Type': 'application/json'
    },
    body:
    {
      fields: {
        project: {
          id: jira.projectId
        },
        summary: bugSummary,
        issuetype: {
          id: jira.issueTypeId
        },
        assignee: {
          name: ''
        },
        labels: [ 'AiXBotBug' ],
        description: jiraIssueDescription({ completeBugDescription, firstName, lastName, email, telegramId })
      }
    },
    json: true
  }
  let createdIssue = await request(options)
  return createdIssue
}

export async function addJsonAttachmentToJiraIssue (createdIssue, jsonObject, jsonName) {
  let jsonFileContent = JSON.stringify(jsonObject)
  var options = {
    method: 'POST',
    url: `${jira.jiraUrl}/issue/${createdIssue.id}/attachments`,
    headers: {
      'Authorization': 'Basic ' + jira.jiraAuth,
      'X-Atlassian-Token': 'no-check',
      'Accept': 'application/json',
      'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    },
    formData: {
      file: {
        value: jsonFileContent,
        options: {
          filename: jsonName + Date.now() + '.json',
          contentType: null
        }
      }
    }
  }

  let createdAttachment = await request(options)
  return createdAttachment
}
