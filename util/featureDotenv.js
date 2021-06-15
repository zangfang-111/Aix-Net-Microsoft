if (process.env.FEATURE_DOTENV) {
  require('dotenv-safe').config({
    allowEmptyValues: false,
  })
}
export default process.env.FEATURE_DOTENV
