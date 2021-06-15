import mongoose from 'mongoose'
import { RFQ_ID_LIMIT } from '../../constants'
import _ from 'lodash'
const { Schema } = mongoose

const RfqSchema = new Schema({
  rfqId: {
    type: Number
  },
  quoteRequestId: {
    type: String
  },
  marketMakerTelegramId: {
    type: String,
    required: true
  },
  financialInstrument: {
    type: Schema.ObjectId,
    ref: 'FinancialInstrument'
  },
  volume: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'OPEN',
    enum: ['OPEN', 'ACTIVE', 'CLOSED_BY_TIMEOUT', 'CLOSED_BY_ERROR', 'CANCELLED']
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

RfqSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      rfqId: this.rfqId,
      quoteRequestId: this.quoteRequestId,
      marketMakerTelegramId: this.marketMakerTelegramId,
      financialInstrument: (this.financialInstrument) ? this.financialInstrument.view(full) : this.financialInstrument,
      volume: this.volume,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

RfqSchema.pre('save', async function (next) {
  const rfqs = await model.find({ status: 'OPEN', marketMakerTelegramId: this.marketMakerTelegramId }).exec()
  const rfqIds = rfqs.map(val => val.rfqId)
  const missingIds = _.difference(Array(RFQ_ID_LIMIT).fill().map((_, idx) => 1 + idx), rfqIds)
  const first = _.first(missingIds)
  if (typeof first !== 'undefined') {
    this.rfqId = first
  } else {
    this.rfqId = _.max(rfqIds) + 1
  }
  next()
})

const model = mongoose.model('Rfq', RfqSchema)

export const schema = model.schema
export default model
