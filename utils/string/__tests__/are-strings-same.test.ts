import { areStringsSame } from '../are-strings-same'

describe('are-strings-same', () => {
  it('returns true if strings are same (equal, regardless of letter case)', () => {
    const input = [
      ['a', 'a'],
      ['a', 'A'],
      ['A', 'a'],
      ['A', 'A'],
      ['bC', 'Bc'],
      ['foo BAR', 'FoO baR'],
    ]

    input.map(
      data => expect(areStringsSame(data[0], data[1])).toBe(true)
    )
  })

  it('returns false if strings are not same', () => {
    const input = [
      ['a', 'ab'],
      ['a', 'd'],
      ['A', 'd'],
      ['foo BAR', 'FoOd baR'],
    ]

    input.map(
      data => expect(areStringsSame(data[0], data[1])).toBe(false)
    )
  })
})
