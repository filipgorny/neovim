import * as R from 'ramda'
import { getSetting } from '../../src/modules/settings/settings-service'
import { findOne as findExam } from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { upsertExamMetrics, upsertExamMetricsAvg } from '../../src/modules/exam-passage-metrics/exam-passage-metrics-service'
import { calculateAvgValues } from './timer-transformers'
import { transformExamIntoSectionPayloadByPassages } from './exam-transformers'
import { fetchPassageMetrics, fetchPassageMetricsWithoutScore, findExams } from './fetch-helpers'
import { adjustSingleQuestionMetrics } from './adjust-single-question-metrics'
import { STUDENT_EXAM_SCORE_STATUS_CALCULATED } from '../../src/modules/student-exams/student-exam-score-statuses'
import { shouldIncludeStudentExamInStats } from '../student-exams/inclusion-in-stats'

const validateIsPenultimateExam = penultimateExam => R.propEq('completed_as', penultimateExam)

const validateExamsAreIntact = R.pipe(
  R.pluck('is_intact'),
  R.all(
    R.equals(true)
  )
)

const validateScoresCalculated = R.propEq('scores_status', STUDENT_EXAM_SCORE_STATUS_CALCULATED)

// Jon changed his mind about only penultimate exmas, for now all intact exams should be included in calculations
// in order to bring back the penultimate validation uncomment lines in the following function
const shouldIncludeInCalculations = async (exam, allExams) => {
  // const penultimateExam = await getSetting('examAmountThreshold')

  if (!shouldIncludeStudentExamInStats(exam)) {
    return false
  }

  return R.allPass([
    // validateIsPenultimateExam(penultimateExam),
    () => validateExamsAreIntact(allExams),
  ])(exam)
}

const updateMetrics = R.curry(
  (avgValues, metricsRecord) => {
    const timings = R.pipe(
      R.prop('timings'),
      JSON.parse
    )(metricsRecord)

    const updatedTimers = R.pipe(
      R.prop('passages'),
      R.map(
        passage => {
          const timing = R.find(
            // @ts-ignore
            R.propEq('order', passage.order)
          )(timings)

          return adjustSingleQuestionMetrics(passage, timing)
        }
      )
    )(avgValues)

    return {
      ...metricsRecord,
      timings: JSON.stringify(updatedTimers),
    }
  }
)

export const fetchCombinedMetrics = async (examTypeId, sectionCount, sectionScaledScore) => {
  const metrics = []

  for (let i = 0; i < sectionCount; i++) {
    metrics.push(
      fetchPassageMetrics(examTypeId, i + 1, sectionScaledScore[i])
    )
  }

  return Promise.all(metrics)
}

const fetchCombinedMetricsWithoutScore = async (examTypeId, sectionCount) => {
  const metrics = []

  for (let i = 0; i < sectionCount; i++) {
    metrics.push(
      fetchPassageMetricsWithoutScore(examTypeId, i + 1)
    )
  }

  return Promise.all(metrics)
}

export const processMetricsForUpdate = avgValues => R.addIndex(R.map)(
  (metricsRecord, index) => (
    R.ifElse(
      R.isNil,
      R.always(avgValues[index]),
      updateMetrics(avgValues[index])
    )(metricsRecord)
  )
)

const getSectionCount = R.path(['exam_length', 'summary', 'sectionCount'])

export const calculateAverageTimePerPassageWithTargetScore = async (exam, student) => {
  const fullExam = await findExam({
    id: exam.id,
  }, ['originalExam', 'sections.passages'])

  const examTypeId = R.path(['originalExam', 'exam_type_id'])(fullExam)
  const allExams = await findExams(examTypeId)(student)

  if (!await shouldIncludeInCalculations(exam, allExams)) {
    return
  }

  const avgValues = R.pipe(
    transformExamIntoSectionPayloadByPassages,
    // @ts-ignore
    calculateAvgValues('passages')
    // @ts-ignore
  )(fullExam)

  const sectionCount = getSectionCount(fullExam)

  const metricsAvg = await fetchCombinedMetricsWithoutScore(examTypeId, sectionCount)
  const metricsToSaveAvg = processMetricsForUpdate(avgValues)(metricsAvg)

  // Handle metrics without scores
  await mapP(
    upsertExamMetricsAvg(examTypeId)
  )(metricsToSaveAvg)

  if (validateScoresCalculated(fullExam)) {
    const sectionScaledScore = R.pipe(
      R.path(['scores', 'sections']),
      R.pluck('scaled_score')
    )(fullExam)

    const metrics = await fetchCombinedMetrics(examTypeId, sectionCount, sectionScaledScore)
    const metricsToSave = processMetricsForUpdate(avgValues)(metrics)

    // Handle metrics with scores
    await mapP(
      upsertExamMetrics(examTypeId)
    )(metricsToSave)
  }

  return true
}
