import { calculateWeightedAverageImprovement } from '../calculate-weighted-average-improvement'

describe('calculate-weighted-average-improvement', () => {
  it('calculates WAI for the first example', () => {
    const scores = [20, 40, 35, 42]
    const result = calculateWeightedAverageImprovement(scores)
    const expected = 5.167

    /**
     * calculations:
     *
     * ((40-20)*1 + (35-40)*2 + (42-35)*3) / (1 + 2 +3)
     */

    expect(result).toBe(expected)
  })

  it('calculates WAI for the second example', () => {
    const scores = [20, 40, 35, 42, 47.167]
    const result = calculateWeightedAverageImprovement(scores)
    const expected = 5.167

    expect(result).toBe(expected)
  })

  it('returns 0 if there is only one score', () => {
    const scores = [34]
    const result = calculateWeightedAverageImprovement(scores)
    const expected = 0

    expect(result).toBe(expected)
  })
})
