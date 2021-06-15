import Trader from './model'

let trader

describe('view', () => {
  beforeEach(async () => {
    trader = await Trader.create({
      telegramId: '123456789',
      password: '123456',
      mobileNumber: 'test',
      firstName: 'test',
      lastName: 'test',
      email: 'test',
      companyName: 'test',
      financialInstrumentsInUse: 'test',
      traderType: 'test'
    })
  })

  it('returns simple view', () => {
    const view = trader.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(trader.id)
    expect(view.telegramId).toBe(trader.telegramId)
    expect(view.mobileNumber).toBe(trader.mobileNumber)
    expect(view.firstName).toBe(trader.firstName)
    expect(view.lastName).toBe(trader.lastName)
    expect(view.email).toBe(trader.email)
    expect(view.companyName).toBe(trader.companyName)
    expect(view.financialInstrumentsInUse).toBe(trader.financialInstrumentsInUse)
    expect(view.traderType).toBe(trader.traderType)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = trader.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(trader.id)
    expect(view.telegramId).toBe(trader.telegramId)
    expect(view.mobileNumber).toBe(trader.mobileNumber)
    expect(view.firstName).toBe(trader.firstName)
    expect(view.lastName).toBe(trader.lastName)
    expect(view.email).toBe(trader.email)
    expect(view.companyName).toBe(trader.companyName)
    expect(view.financialInstrumentsInUse).toBe(trader.financialInstrumentsInUse)
    expect(view.traderType).toBe(trader.traderType)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
