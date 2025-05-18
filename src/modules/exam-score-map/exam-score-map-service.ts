import { stitchArraysByProp } from '@desmart/js-utils'
import mapP from '@desmart/js-utils/dist/function/mapp'
import * as R from 'ramda'
import { collectionToJson } from '../../../utils/model/collection-to-json'
import { increaseAmountCorrectForSection } from '../exam-section-score-map/exam-section-score-map-service'
import { findOne, create, patch, findOneOrFail } from './exam-score-map-repository'

const getScoreMinFromSections = R.pipe(
  R.pluck('score_min'),
  R.sum
)

const getScoreMaxFromSections = R.pipe(
  R.pluck('score_max'),
  R.sum
)

export const initializeExamScoreMap = async (exam) => {
  const examScoreMapElement = await findOne({ exam_id: exam.id })

  if (examScoreMapElement) {
    // scores alreary initialized
    return
  }

  const score_min = getScoreMinFromSections(exam.sections)
  const score_max = getScoreMaxFromSections(exam.sections)

  for (let i = score_min; i <= score_max; i += 1) {
    const scoreMapElement = {
      exam_id: exam.id,
      score: i,
      student_amount: 0,
      percentile_rank: 0,
    }

    await create(scoreMapElement)
  }
}

export const getPercentileRankByExamIdAndScore = async (exam_id: string, score: number) => (
  R.pipeWith(R.andThen)([
    async () => findOneOrFail({ exam_id, score }),
    R.prop('percentile_rank'),
  ])(true)
)

const isAnsweredCorrectly = question => (
  question.correct_answer === question.answer
)

const countCorrectAnswers = section => {
  const correctAnswerAmount = R.pipe(
    R.prop('questions'),
    R.filter(isAnsweredCorrectly),
    R.length
  )(section)

  return {
    order: section.order,
    correct_answers: correctAnswerAmount,
  }
}

const increaseAmountCorrectForExam = exam => async (scaledScore: number) => {
  try {
    const examScoreMapElement = await findOne({ exam_id: exam.id, score: scaledScore })

    return patch(examScoreMapElement.id, { student_amount: examScoreMapElement.student_amount + 1 })
  } catch (e) {
    // if exam score map does not exist - do nothing
  }
}

export const updateExamScoreMap = async (flatExam, originalExam) => {
  const answers = R.map(countCorrectAnswers)(flatExam)

  const scoreMaps = await R.pipe(
    stitchArraysByProp('order', originalExam.sections),
    R.map(
      R.pick(['order', 'correct_answers', 'id'])
    ),
    mapP(increaseAmountCorrectForSection)
  )(answers)

  const examScaledScore = R.pipe(
    R.filter(R.identity),
    collectionToJson,
    R.pluck('score'),
    R.sum
  )(scoreMaps)

  await increaseAmountCorrectForExam(originalExam)(examScaledScore)
}
