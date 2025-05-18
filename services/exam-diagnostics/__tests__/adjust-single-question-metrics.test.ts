import { adjustSingleQuestionMetrics } from '../adjust-single-question-metrics'

describe('adjust-single-question-metrics', () => {
  it('adjusts partial and average values for timers in single question - ex. 1', () => {
    const avgValuesSingleQuestion = {
      order: 1,
      timers: {
        checking_sum: 51,
        checking_divisor: 1,
        checking_avg: 196,
        reading_sum: 5,
        reading_divisor: 1,
        reading_avg: 5,
        working_sum: 11,
        working_divisor: 1,
        working_avg: 11
      }
    }

    const metricsRecordSingleQuestion = {
      order: 1,
      timers: {
        checking_sum: 196,
        checking_divisor: 1,
        checking_avg: 196,
        reading_sum: 5,
        reading_divisor: 1,
        reading_avg: 5,
        working_sum: 11,
        working_divisor: 1,
        working_avg: 11
      }
    }

    const result = adjustSingleQuestionMetrics(avgValuesSingleQuestion, metricsRecordSingleQuestion)

    const expected = {
      order: 1,
      timers: {
        checking_avg: 124,
        checking_divisor: 2,
        checking_sum: 247,
        reading_avg: 5,
        reading_divisor: 2,
        reading_sum: 10,
        working_avg: 11,
        working_divisor: 2,
        working_sum: 22
      }
    }

    expect(result).toEqual(expected)
  })

  it('adjusts partial and average values for timers in single question (preserved order) - ex. 2', () => {
    const avgValuesSingleQuestion = {
      order: 3,
      timers: {
        checking_sum: 33,
        checking_divisor: 1,
        checking_avg: 196,
        reading_sum: 20,
        reading_divisor: 1,
        reading_avg: 5,
        working_sum: 55,
        working_divisor: 1,
        working_avg: 11
      }
    }

    const metricsRecordSingleQuestion = {
      order: 3,
      timers: {
        checking_sum: 50,
        checking_divisor: 3,
        checking_avg: 196,
        reading_sum: 99,
        reading_divisor: 3,
        reading_avg: 5,
        working_sum: 113,
        working_divisor: 3,
        working_avg: 11
      }
    }

    const result = adjustSingleQuestionMetrics(avgValuesSingleQuestion, metricsRecordSingleQuestion)

    const expected = {
      order: 3,
      timers: {
        checking_avg: 21,
        checking_divisor: 4,
        checking_sum: 83,
        reading_avg: 30,
        reading_divisor: 4,
        reading_sum: 119,
        working_avg: 42,
        working_divisor: 4,
        working_sum: 168
      }
    }

    expect(result).toEqual(expected)
  })
})
