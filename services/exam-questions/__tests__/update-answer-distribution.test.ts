import { updateAnswerDistribution } from '../update-answer-distribution'

describe('update-answer-distribution', () => {
  it('update answer distribution', () => {
    const answerDistribution = {
      A: {
        amount: 0,
        percentage: 0,
      },
      B: {
        amount: 0,
        percentage: 0,
      },
      C: {
        amount: 10,
        percentage: 63,
      },
      D: {
        amount: 6,
        percentage: 38,
      },
    }

    const result = updateAnswerDistribution('C', 17)(answerDistribution)

    const expected = {
      A: {
        amount: 0,
        percentage: 0,
      },
      B: {
        amount: 0,
        percentage: 0,
      },
      C: {
        amount: 11,
        percentage: 65,
      },
      D: {
        amount: 6,
        percentage: 35,
      },
    }

    expect(result).toEqual(expected)
  })
})
