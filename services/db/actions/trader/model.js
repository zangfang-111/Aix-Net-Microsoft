
import mongoose from 'mongoose'

const { Schema } = mongoose
const walletSchema = new Schema({
  currency: String,
  address: String
})

const bankDetailsSchena = new Schema({
  beneficiaryName: String,
  beneficiaryAddress: String,
  accountNumber: String,
  routingNumber: String,
  bankName: String,
  bankAddress: String
})

const traderSchema = new Schema({
  telegramId: {
    type: String,
    match: /^[0-9]{9}$/,
    required: true,
    unique: true
  },
  mobileNumber: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  email: {
    type: String
  },
  companyName: {
    type: String
  },
  sessionId: {
    type: String
  },
  financialInstrumentsInUse: {
    type: Array
  },
  traderType: {
    type: String
  },
  bankDetails: {
    type: bankDetailsSchena
  },
  wallet: {
    type: [walletSchema]
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

traderSchema.methods = {
  getId () {
    return this.id
  },
  getTelegramId () {
    return this.telegramId
  },
  getFirstName () {
    return this.firstName
  },
  getLastName () {
    return this.lastName
  },
  getEmail () {
    return this.email
  },
  getWallet () {
    return this.wallet
  },
  getBankDetails () {
    return this.bankDetails
  },
  view (full) {
    const view = {
      // simple view
      id: this.id,
      telegramId: this.telegramId,
      mobileNumber: this.mobileNumber,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      bankDetails: this.bankDetails,
      wallet: this.wallet,
      companyName: this.companyName,
      financialInstrumentsInUse: this.financialInstrumentsInUse,
      traderType: this.traderType,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

const model = mongoose.model('Trader', traderSchema)

// export const Schema = model.schema
export default model
