import { expect } from 'chai'
import { ServiceBroker } from 'moleculer'
import DashboardAdmin from '../db/actions/dashboard-admin/model'
import request from 'superagent'

const broker = new ServiceBroker({ logger: false })

let newAdmin
let token = ''
const API_URL = 'http://0.0.0.0:8080/dashboard-api'
describe('Api Dashboard Service', () => {
  beforeAll(async function () {
    await broker.loadService(`./services/db/db.service.js`)
    await broker.loadService(`./services/api-dashboard/api-dashboard.service.js`)
    await broker.start()
  })

  afterAll(async function () {
    await DashboardAdmin.deleteMany({})
    await broker.stop()
  })

  describe('login', () => {
    it('should return admin & token', async () => {
      newAdmin = await broker.call('db.admin.create', {
        email: 'test@mail.com',
        password: '123456'
      })
      const res = await request
        .post(`${API_URL}/auth/login`)
        .send({ email: 'test@mail.com', password: '123456' })
        .set('accept', 'json')
      token = res.body.token
      expect(typeof res.body).to.equal('object')
    })
  })

  describe('getByEmail', () => {
    it('should return admin', async () => {
      const res = await request
        .get(`${API_URL}/admins/test@mail.com`)
        .set('Authorization', `Bearer ${token}`)
        .set('accept', 'json')
      expect(res.body.email).to.equal(newAdmin.email)
    })
  })
})
