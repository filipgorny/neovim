import { getClosestValueOrDefault } from '../get-closest-value-or-default'

const data = [
  { score: 129, correct_answers: 5, percentile_rank: 2.5 },
  { score: 131, correct_answers: 8, percentile_rank: 8 },
  { score: 128, correct_answers: 2, percentile_rank: 1 },
  { score: 130, correct_answers: 7, percentile_rank: 4 },
]

describe('get-closest-value-or-default', () => {
  it('returns precise item if correct_answers match', () => {
    const expected = { score: 130, correct_answers: 7, percentile_rank: 4 }
    const result = getClosestValueOrDefault(7)(data)

    expect(result).toEqual(expected)
  })

  it('returns closest lower item if correct_answers does not match', () => {
    const expected = { score: 128, correct_answers: 2, percentile_rank: 1 }
    const result = getClosestValueOrDefault(4)(data)

    expect(result).toEqual(expected)
  })

  it('returns default item if did not find lower item', () => {
    const expected = { score: 118, correct_answers: 0, percentile_rank: 0 }
    const result = getClosestValueOrDefault(1)(data)

    expect(result).toEqual(expected)
  })
})
