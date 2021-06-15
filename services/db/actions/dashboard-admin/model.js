import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const saltRounds = 10

const DashboardAdmin = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

DashboardAdmin.methods = {
  view (full) {
    const view = {
      // simple view
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

DashboardAdmin.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, saltRounds)
  this.password = hash
  next()
})

const model = mongoose.model('DashboardAdmin', DashboardAdmin)

export const schema = model.schema
export default model
