import DashboardAdmin from './model'

export default {
  getAdminByEmail: {
    params: {
      email: { type: 'email' }
      // $$strict: true
    },
    async handler (ctx) {
      const query = { email: ctx.params.email }
      const admin = await DashboardAdmin.findOne(query).exec()
      if (admin) {
        return admin.view()
      }
      return null
    }
  },
  create: {
    params: {
      email: { type: 'email' },
      password: { type: 'string', min: 6 }
      // $$strict: true
    },
    async handler (ctx) {
      try {
        if (!ctx.params.password) {
          throw new Error('Invalid Password')
        }
        const admin = new DashboardAdmin({
          email: ctx.params.email,
          password: ctx.params.password
        })
        await admin.save()
        if (admin) {
          return admin.view()
        }
      } catch (e) {
        throw e
      }
    }
  }
}
