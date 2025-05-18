import { calculateQuestionDifficulty } from '../calculate-question-difficulty'

describe('calculate-question-difficulty', () => {
  it('calculates question difficulty', () => {
    const scenarios = [
      { correctAmount: 12, allAmount: 24, expected: 50 },
      { correctAmount: 0, allAmount: 24, expected: 100 },
      { correctAmount: 3, allAmount: 24, expected: 88 },
      { correctAmount: 0, allAmount: 0, expected: 0 },
    ]

    scenarios.map(
      scenario => expect(calculateQuestionDifficulty(scenario.correctAmount, scenario.allAmount)).toEqual(scenario.expected)
    )
  })
})
