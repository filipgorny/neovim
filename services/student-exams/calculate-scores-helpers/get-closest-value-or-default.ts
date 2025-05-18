import * as R from 'ramda'

const defaultValue = { score: 118, correct_answers: 0, percentile_rank: 0 }

const sortByCorrectAnswers = R.sort(
  R.ascend(
    R.prop('correct_answers')
  )
)

const rejectGreaterThanAmountCorrect = amountCorrect => R.reject(
  R.propSatisfies(
    R.lt(amountCorrect),
    'correct_answers'
  )
)

const valueOrDefault = defaultValue => R.when(
  R.isNil,
  R.always(defaultValue)
)

/**
 * Returns the closest matching (correct answer amount) section scaled score.
 * If the precise score is not found, the closest lower is returned.
 *
 * Example:
 * Section scaled scores are defined for 3 and 5 correct answers, amountCorrect = 3
 * so the precise score will be returned. When amountCorrect = 4, also the score
 * for 3 correct answers will be returned as it is the closest matching one.
 */
export const getClosestValueOrDefault = (amountCorrect) => data => (
  R.pipe(
    sortByCorrectAnswers,
    rejectGreaterThanAmountCorrect(amountCorrect),
    R.last,
    valueOrDefault(defaultValue)
  )(data)
)
