import * as R from 'ramda'
import { getClosestValueOrDefault } from './get-closest-value-or-default'

const findOriginalSectionByOrder = (sectionScore, exam) => (
  R.pipe(
    R.path(['originalExam', 'sections']),
    R.find(
      R.propEq('order', sectionScore.order)
    )
  )(exam)
)

const findSectionScoreByAmountCorrect = amountCorrect => R.pipe(
  R.prop('scores'),
  getClosestValueOrDefault(amountCorrect)
)

export const calculateManufacturedScores = async (sectionScore, exam) => {
  const section = findOriginalSectionByOrder(sectionScore, exam)
  const score = findSectionScoreByAmountCorrect(sectionScore.amount_correct)(section)

  return {
    ...sectionScore,
    scaled_score: R.propOr(118, 'score', score),
    percentile_rank: R.propOr(0, 'percentile_rank', score),
  }
}
