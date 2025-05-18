import * as R from 'ramda'
import { calculateDifferences } from '../../../../services/exam-section-scores/exam-section-score-service'
import { customException, throwException } from '../../../../utils/error/error-factory'
import mapP from '../../../../utils/function/mapp'
import { createForSection, dropBySectionId } from '../../exam-section-scores/exam-section-scores-service'

const sumPercentage = R.pipe(
  R.pluck('percentage'),
  R.map(Number),
  R.sum
)

const validateSum = sum => (
  R.unless(
    R.equals(100.0),
    () => throwException(customException('percentage-sum.not-100', 422, `Calculated percentage (bar height; from percentile rank) of ${sum} does not equal 100.0`))
  )(sum)
)

const sortByScores = R.sortWith([
  R.ascend(
    R.prop('score')
  ),
])

const createRecordForSection = section_id => async item => (
  createForSection(section_id)(item.score, item.correct_answers, item.percentile_rank, item.percentage)
)

export default async (section_id: string, payload) => {
  const data = R.pipe(
    R.prop('scores'),
    sortByScores,
    calculateDifferences
  )(payload)

  validateSum(sumPercentage(data))

  await dropBySectionId(section_id)

  return mapP(
    createRecordForSection(section_id)
  )(data)
}
