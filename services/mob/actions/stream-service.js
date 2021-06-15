export const startStreamService = ctx => {
  const { endpoint, notificationName } = ctx.params

  try {
    ctx.service.streamClient.startStreaming(endpoint, notificationName)
  } catch (error) {
    throw error
  }
}
