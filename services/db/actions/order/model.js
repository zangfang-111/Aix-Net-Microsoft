import mongoose from 'mongoose'

const { Schema } = mongoose

const orderSchema = new Schema({
  orderId: {
    type: String
  },
  combinedId: {
    type: String
  },
  telegramId: {
    type: String
  },
  financialInstrumentLabel: {
    type: String,
    enum: ['ETH', 'BTC', 'XRP', 'LTC']
  },
  orderStatus: {
    type: String
  },
  executedStatus: {
    type: String
  },
  orderType: {
    type: String,
    enum: ['ONE', 'TWO']
  },
  side: {
    type: String,
    enum: ['BUY', 'SELL']
  },
  price: {
    type: Number
  },
  quantity: {
    type: Number
  },
  executedQuantity: {
    type: Number
  },
  initialQuantity: {
    type: Number
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

orderSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      orderId: this.orderId,
      combinedId: this.combinedId,
      telegramId: this.telegramId,
      financialInstrumentLabel: this.financialInstrumentLabel,
      orderStatus: this.orderStatus,
      executedStatus: this.executedStatus,
      orderType: this.orderType,
      side: this.side,
      price: this.price,
      quantity: this.quantity,
      executedQuantity: this.executedQuantity,
      initialQuantity: this.initialQuantity,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Order', orderSchema)

export default model
