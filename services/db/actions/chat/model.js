import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema({
  sessionId: {
    type: String
  },
  senderId: {
    type: String
  },
  message: {
    type: String
  },
  isBotMessage: {
    type: Boolean
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

ChatSchema.methods = {
  view (full) {
    const view = {
      // simple view
      sessionId: this.sessionId,
      senderId: this.senderId,
      message: this.message,
      isBotMessage: this.isBotMessage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Chat', ChatSchema)

export const schema = model.schema
export default model
