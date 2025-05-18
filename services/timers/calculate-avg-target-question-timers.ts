import * as R from 'ramda'
import mapP from '../../utils/function/mapp'
import { embedKeyAsProp } from '../../utils/object/embed-key-as-prop'
import { buildTimerPayload } from './timer-utils'
import { findOne, create, patch } from '../../src/modules/exam-question-time-metrics/exam-question-time-metrics-repository'
import { stitchArraysByProp } from '../../utils/array/stitch-arrays-by-prop'
import { STUDENT_EXAM_SCORE_STATUS_CALCULATED } from '../../src/modules/student-exams/student-exam-score-statuses'

const findMetrics = async (exam_id, exam_question_id, section_score) => (
  findOne({
    exam_id,
    exam_question_id,
    section_score,
  })
)

const createMetrics = async questionSet => {
  const payload = buildTimerPayload(questionSet)({
    id: null,
    checking_sum: 0,
    checking_divisor: 0,
    checking_avg: 0,
    reading_sum: 0,
    reading_divisor: 0,
    reading_avg: 0,
    working_sum: 0,
    working_divisor: 0,
    working_avg: 0,
  })

  return create({
    exam_id: questionSet.exam_id,
    exam_question_id: questionSet.original_exam_question_id,
    section_score: questionSet.section_score,
    ...payload,
  })
}

const updateMetrics = async (metrics, questionSet) => {
  const payload = buildTimerPayload(questionSet)(metrics)

  return patch(metrics.id, payload)
}

const upsertQuestionMetrics = async questionSet => {
  // if (!questionSet.working) {
  //   return
  // }

  const metrics = await findMetrics(
    questionSet.exam_id,
    questionSet.original_exam_question_id,
    questionSet.section_score
  )

  return metrics ? updateMetrics(metrics, questionSet) : createMetrics(questionSet)
}

const calculateAvgQuestionTimersPerSection = (exam, questionTimers, sectionOrder) => async questions => {
  if (exam.scores_status !== STUDENT_EXAM_SCORE_STATUS_CALCULATED) {
    return
  }

  return R.pipe(
    embedKeyAsProp('original_exam_question_id'),
    // @ts-ignore
    stitchArraysByProp('original_exam_question_id', questions),
    // @ts-ignore
    R.map(
      R.pick(['original_exam_question_id', 'reading', 'working', 'checking'])
    ),
    R.map(
      R.mergeRight({
        exam_id: exam.exam_id,
        section_score: exam.scores.sections[sectionOrder].scaled_score,
      })
    ),
    mapP(upsertQuestionMetrics)
    // @ts-ignore
  )(questionTimers)
}

export const calculateAvgTargetQuestionTimers = async (exam, questionTimers, flatSections) => (
  R.addIndex(R.map)(
    (sectionData, i) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      R.pipe(
        R.prop('questions'),
        calculateAvgQuestionTimersPerSection(exam, questionTimers, i)
      )(sectionData)
    }
  )(flatSections)
)
