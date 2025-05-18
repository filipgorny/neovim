import { findKeyByReducer } from '../find-key-by-reducer'

describe('find-key-by-reducer', () => {
  it('renames selected props in object', () => {
    const input = {
      foo: 15,
      bar: 14,
      baz: 16
    }

    const expected = 'bar'

    const findKeyWithLowestValue = findKeyByReducer(
      (acc, value) => value[1] < acc[1] ? value : acc,
      [null, 1000]
    )

    expect(findKeyWithLowestValue(input)).toEqual(expected)
  })
})
