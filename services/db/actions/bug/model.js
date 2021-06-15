import mongoose from 'mongoose'

const { Schema } = mongoose
const bugSchema = new Schema({
  bug_description: {
    type: String
  },
  session: {
    type: Object
  },
  user_telegram_id: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

bugSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      bug_description: this.bug_description,
      user_telegram_id: this.user_telegram_id,
      session: this.session,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Bug', bugSchema)

export const schema = model.schema
export default model
