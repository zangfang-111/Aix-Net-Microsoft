import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'
import DashboardAdmin from '../../db/actions/dashboard-admin/model'
import auth from './auth'

const broker = new ServiceBroker({ logger: false })

let newAdmin

describe('Api Dashboard Auth Actions', () => {
  beforeAll(async function () {
    await broker.loadService(`./services/db/db.service.js`)
    await broker.start()
    newAdmin = new DashboardAdmin({
      email: 'test2@mail.com',
      password: '123456'
    })
    await newAdmin.save()
  })

  afterAll(async function () {
    await DashboardAdmin.deleteMany({})
    await broker.stop()
  })

  describe('login', () => {
    it('should return the admin & token', async () => {
      const ctx = {
        params: {
          email: 'test2@mail.com',
          password: '123456'
        },
        broker
      }
      const { admin, token } = await auth.login.handler(ctx)

      expect(typeof admin).to.equal('object')
      expect(admin.email).to.equal('test2@mail.com')
      expect(typeof token).to.equal('string')
    })
  })
})
