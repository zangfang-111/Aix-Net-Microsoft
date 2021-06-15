const getSessionId = sreAnswer => {
  if (sreAnswer.sessionId !== undefined) {
    return sreAnswer.sessionId
  }
  return null
}

const getIntentName = sreAnswer => {
  if (sreAnswer.context.intent !== undefined && sreAnswer.context.scenario === undefined) {
    return sreAnswer.context.intent
  }
  return null
}

const getContext = sreAnswer => {
  if (sreAnswer.context !== undefined) {
    return sreAnswer.context
  }
  return null
}

export default {
  getSessionId,
  getIntentName,
  getContext
}
