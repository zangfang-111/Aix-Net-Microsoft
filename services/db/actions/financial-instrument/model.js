import mongoose from 'mongoose'

const financialInstrumentSchema = new mongoose.Schema({
  label: {
    type: String
  },
  name: {
    type: String
  },
  category: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

financialInstrumentSchema.methods = {
  getLabel () {
    return this.label
  },
  getName () {
    return this.name
  },

  view (full) {
    const view = {
      // simple view
      id: this.id,
      label: this.label,
      name: this.name,
      category: this.category,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('FinancialInstrument', financialInstrumentSchema)

export const schema = model.schema
export default model
