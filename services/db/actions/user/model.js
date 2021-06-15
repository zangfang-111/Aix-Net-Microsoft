import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const saltRounds = 10

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

UserSchema.methods = {
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

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, saltRounds)
  this.password = hash
  next()
})

const model = mongoose.model('User', UserSchema)

export const schema = model.schema
export default model
