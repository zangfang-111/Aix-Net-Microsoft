import FinancialInstrument from './model'

let financialInstrument

beforeEach(async () => {
  financialInstrument = await FinancialInstrument.create({ label: 'test', name: 'test', category: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = financialInstrument.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(financialInstrument.id)
    expect(view.label).toBe(financialInstrument.label)
    expect(view.name).toBe(financialInstrument.name)
    expect(view.category).toBe(financialInstrument.category)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = financialInstrument.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(financialInstrument.id)
    expect(view.label).toBe(financialInstrument.label)
    expect(view.name).toBe(financialInstrument.name)
    expect(view.category).toBe(financialInstrument.category)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
