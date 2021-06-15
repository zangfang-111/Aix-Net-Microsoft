import mongoose, { Schema } from 'mongoose'

const infoCardSchema = new Schema({
  label: {
    type: String
  },
  content: {
    type: Object
  },
  filePath: {
    type: String
  },
  url: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

infoCardSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      label: this.label,
      content: this.content,
      filePath: this.filePath,
      url: this.url,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('InfoCard', infoCardSchema)

export const schema = model.schema
export default model
