import { average } from '../average'

describe('average', () => {
  it('calculates average value from an array', () => {
    const input = [3, 10, 24, 40]
    const expected = 19.25

    expect(average(input)).toEqual(expected)
  })

  it('returns 0 on empty array', () => {
    const input = []
    const expected = 0

    expect(average(input)).toEqual(expected)
  })
})
