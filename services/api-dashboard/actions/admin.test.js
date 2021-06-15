import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'
import DashboardAdmin from '../../db/actions/dashboard-admin/model'
import admin from './admin'

const broker = new ServiceBroker({ logger: false })

let newAdmin

describe('Api Dashboard Admin Actions', () => {
  beforeAll(async function () {
    await broker.loadService(`./services/db/db.service.js`)
    await broker.start()
    newAdmin = new DashboardAdmin({
      email: 'test4@mail.com',
      password: '123456'
    })
    await newAdmin.save()
  })

  afterAll(async function () {
    await DashboardAdmin.deleteMany({})
    await broker.stop()
  })

  describe('getByEmail', () => {
    it('should return the admin', async () => {
      const ctx = {
        params: {
          email: 'test4@mail.com'
        },
        broker
      }
      const response = await admin.get.handler(ctx)
      expect(typeof response).to.equal('object')
      expect(response.email).to.equal('test4@mail.com')
    })
  })

  describe('createAdmin', () => {
    it('should create & return the admin', async () => {
      const ctx = {
        params: {
          email: 'test3@mail.com',
          password: '123456'
        },
        broker
      }
      const response = await admin.create.handler(ctx)
      expect(typeof response).to.equal('object')
      expect(response.email).to.equal('test3@mail.com')
    })
  })
})
