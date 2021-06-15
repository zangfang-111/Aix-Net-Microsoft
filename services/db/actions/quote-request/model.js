import mongoose from 'mongoose'

import { QUOTE_REQUEST_STATUSES } from '../../constants'

const { Schema } = mongoose

const quoteRequestSchema = new Schema({
  initiatingTrader: {
    type: Schema.Types.ObjectId,
    ref: 'Trader'
  },
  financialInstrument: {
    type: Schema.Types.ObjectId,
    ref: 'FinancialInstrument'
  },
  quantity: {
    type: Number
  },
  quoteRequestId: {
    type: Number
  },
  quotesUpdates: {
    type: Array
  },
  createdQuoteRequestEvent: {
    type: Object
  },
  expiredQuoteRequestEvent: {
    type: Object
  },
  canceledQuoteRequestEvent: {
    type: Object
  },
  status: {
    type: String,
    enum: [
      QUOTE_REQUEST_STATUSES.OPEN,
      QUOTE_REQUEST_STATUSES.CANCELLED,
      QUOTE_REQUEST_STATUSES.EXPIRED
    ]
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

quoteRequestSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      initiatingTrader: this.initiatingTrader.view(true),
      financialInstrument: this.financialInstrument.view(true),
      quantity: this.quantity,
      quoteRequestId: this.quoteRequestId,
      quotesUpdates: this.quotesUpdates,
      createdQuoteRequestEvent: this.createdQuoteRequestEvent,
      expiredQuoteRequestEvent: this.expiredQuoteRequestEvent ? this.expiredQuoteRequestEvent : null,
      canceledQuoteRequestEvent: this.canceledQuoteRequestEvent ? this.canceledQuoteRequestEvent : null,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('QuoteRequest', quoteRequestSchema)

export default model
