import { excerptFromList } from '../excerpt-from-list'

const buildList = n => {
  const list = []

  for (let i = 1; i <= n; i++) {
    list.push({ id: `${i}` })
  }

  return list
}

describe('excerpt-from-list', () => {
  it('returns a portion from a list, centered on the item with id=51', () => {
    const list = buildList(60)

    const result = excerptFromList('51')(list)

    expect(result.length).toEqual(10)
    expect(result[0].id).toEqual('47')
    expect(result[4].id).toEqual('51')
    expect(result[9].id).toEqual('56')
  })

  it('returns a portion from a list, not centered', () => {
    const list = buildList(20)

    const result = excerptFromList('2')(list)

    expect(result.length).toEqual(10)
    expect(result[0].id).toEqual('1')
    expect(result[1].id).toEqual('2')
    expect(result[9].id).toEqual('10')
  })
})
