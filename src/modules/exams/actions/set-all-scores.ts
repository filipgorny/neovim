import * as R from 'ramda'
import { calculateDifferences } from '../../../../services/exam-section-scores/exam-section-score-service'
import { customException, throwException } from '../../../../utils/error/error-factory'
import mapP from '../../../../utils/function/mapp'
import { createForExam, dropByExamId } from '../../exam-scores/exam-scores-service'

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

const createRecordForExam = exam_id => async item => (
  createForExam(exam_id)(item.score, item.percentile_rank, item.percentage)
)

export default async (exam_id: string, payload) => {
  const data = R.pipe(
    R.prop('scores'),
    sortByScores,
    calculateDifferences
  )(payload)

  validateSum(sumPercentage(data))

  await dropByExamId(exam_id)

  return mapP(
    createRecordForExam(exam_id)
  )(data)
}
