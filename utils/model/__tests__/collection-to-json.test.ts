import { collectionToJson } from '../collection-to-json'

describe('collection-to-json', () => {
  it('invokes toJSON method on each item of the collection', () => {
    const input = [
      {
        toJSON: () => 42,
      },
      {
        toJSON: () => 'foo',
      },
    ]

    const expected = [42, 'foo']

    const result = collectionToJson(input)

    expect(result).toEqual(expected)
  })
})
