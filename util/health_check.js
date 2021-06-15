const { ServiceBroker } = require('moleculer')

const config = {
  nodeID: process.env.NODEID,
  namespace: process.env.NAMESPACE,
  transporter: process.env.TRANSPORTER,
  logger: null
}
const broker = new ServiceBroker(config)
broker.createService({
  name: 'health'
});

(async () => {
  try {
    await broker.start()
    await broker.call('$node.health')
    process.exit()
  } catch (error) {
    if (error) {
      console.log(error.message)
    }
    process.exit(1)
  }
})()
