import InfoCard from './model'

let infoCard

beforeEach(async () => {
  infoCard = await InfoCard.create({ label: 'test', content: 'test', filePath: 'test', url: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = infoCard.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(infoCard.id)
    expect(view.label).toBe(infoCard.label)
    expect(view.content).toBe(infoCard.content)
    expect(view.filePath).toBe(infoCard.filePath)
    expect(view.url).toBe(infoCard.url)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = infoCard.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(infoCard.id)
    expect(view.label).toBe(infoCard.label)
    expect(view.content).toBe(infoCard.content)
    expect(view.filePath).toBe(infoCard.filePath)
    expect(view.url).toBe(infoCard.url)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})
