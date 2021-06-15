import User from './model'

export default {
  async getUserByEmail (ctx) {
    const query = { email: ctx.params }
    const user = await User.findOne(query).exec()
    if (user) {
      return user.view()
    }
    return null
  }
}
