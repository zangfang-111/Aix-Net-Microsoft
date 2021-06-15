
function myMiddleware() {
  return handler => (ctx) => {
    ctx.broker.logger.warn('>> MW1-before (from config)')
    ctx.broker.logger.warn('>> MW1-before (from config)')
    const res = handler(ctx)
    ctx.broker.logger.warn('<< MW1-after (from config)')
    return res
  }
}

module.exports = {
  middlewares: [myMiddleware()],
  namespace: process.env.NAMESPACE,
  nodeID: process.env.NODEID,
  logger: true
}

