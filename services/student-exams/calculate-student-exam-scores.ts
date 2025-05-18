import * as R from 'ramda'
import { processInBatches } from '../../services/batch/batch-processor'
import { fetchCustom } from '../../utils/model/fetch'
import { ScaledScore, StudentExam } from '../../src/models'
import { patch, findAllCompletedExams, findOne as findExam } from '../../src/modules/student-exams/student-exam-repository'
import mapP from '../../utils/function/mapp'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { STUDENT_EXAM_SCORE_STATUS_CALCULATED, STUDENT_EXAM_SCORE_STATUS_PENDING } from '../../src/modules/student-exams/student-exam-score-statuses'
import { findOne as findOnePercentile } from '../../src/modules/percentile-ranks/percentile-rank-repository'
import { findCustom as findOneScaledScore } from '../../src/modules/scaled-scores/scaled-score-repository'
import { fetchExamTypeTemplates } from '../../src/modules/exam-type-scaled-score-templates/exam-type-scaled-score-template-repository'
import { findOne as findExamType } from '../../src/modules/exam-types/exam-type-repository'
import { calculatePTS } from '../../services/student-exams/calculate-projected-target-score'
import { setPTSBySections } from '../../src/modules/student-exam-scores/student-exam-scores-service'
import { flattenQuestionsCustom } from './flatten-questions'
import { extractPassageTimers, extractQuestionTimers, parseExamTimers } from '../timers/timer-utils'
import { calculateAvgTargetQuestionTimers } from '../timers/calculate-avg-target-question-timers'
import { calculateAvgTargetPassageTimers } from '../timers/calculate-avg-target-passage-timers'
import { transformExamIntoSectionPayloadByPassages } from '../exam-diagnostics/exam-transformers'
import { fetchCombinedMetrics, processMetricsForUpdate } from '../exam-diagnostics/calculate-target-score-average-time-per-passage'
import { upsertExamMetrics } from '../../src/modules/exam-passage-metrics/exam-passage-metrics-service'
import { calculateAvgValues } from '../exam-diagnostics/timer-transformers'
import { ScoreCalculationMethod } from '../../src/modules/exams/score-calculation-methods'

const RECORDS_PER_BATCH = 100

const log = batchNumber => console.log(`-> calculate student exam scores; batch ${batchNumber}`)

const buildPaginationData = (batchNumber, step) => ({
  limit: {
    page: batchNumber + 1,
    take: step,
  },
  order: {
    by: 'title',
    dir: 'asc',
  },
})

const findScaledScoreTemplateId = order => examTypeTemplates => R.pipe(
  R.find(
    R.propEq('order', order)
  ),
  R.prop('template_id')
)(examTypeTemplates)

const fetchMatchingScaledScore = async (templateId, percentileRank) => R.pipeWith(R.andThen)([
  async () => findOneScaledScore(
    ScaledScore.where({ template_id: templateId }).andWhereRaw(`percentile_rank::numeric <= '${percentileRank}'::numeric`)
  )({ page: 1, take: 1 }, { by: 'scaled_score', dir: 'desc' }),
  R.prop('data'),
  collectionToJson,
  R.head,
])(true)

const calculateSectionScoresAndPercentile = examTypeId => async section => {
  const percentile = await findOnePercentile({
    exam_type_id: examTypeId,
    section_order: section.order,
    correct_answer_amount: section.amount_correct,
  })
  const examTypeTemplates = await fetchExamTypeTemplates(examTypeId)
  const templateId = findScaledScoreTemplateId(section.order)(examTypeTemplates)
  const scaledScoreTemplate = await fetchMatchingScaledScore(templateId, percentile.percentile_rank)

  return {
    ...section,
    scaled_score: scaledScoreTemplate.scaled_score,
    percentile_rank: percentile.percentile_rank,
  }
}

const mapSections = (examTypeId) => async sections => (
  mapP(
    calculateSectionScoresAndPercentile(examTypeId)
  )(sections)
)

const getExamPercentileRank = async (exam_type_id, correct_answer_amount) => (
  findOnePercentile({
    exam_type_id,
    section_order: 0,
    correct_answer_amount,
  })
)

const pluckAndSumProp = prop => R.pipe(
  R.pluck(prop),
  R.sum
)

const mapExam = (examTypeId, sections) => async exam => {
  const scaledScore = pluckAndSumProp('scaled_score')(sections)
  const amountCorrect = pluckAndSumProp('amount_correct')(sections)
  const percentileRank = await getExamPercentileRank(examTypeId, amountCorrect)

  return {
    ...exam,
    scaled_score: scaledScore,
    amount_correct: amountCorrect,
    percentile_rank: percentileRank.percentile_rank,
  }
}

const getSectionCount = R.path(['exam_length', 'summary', 'sectionCount'])

const updateExamAvgTimers = async (examType, exam) => {
  const fullExam = await findExam({
    id: exam.id,
  }, ['originalExam', 'sections.passages.questions.originalQuestion'])

  // begin calculate-target-score-average-timers-per-question
  const flatSections = flattenQuestionsCustom(fullExam, {
    withOriginalQuestions: true,
  })

  const timers = parseExamTimers(fullExam)
  const questionTimers = extractQuestionTimers(timers)
  const passageTimers = extractPassageTimers(timers)

  await Promise.all([
    calculateAvgTargetQuestionTimers(fullExam, questionTimers, flatSections),
    calculateAvgTargetPassageTimers(fullExam, passageTimers, flatSections),
  ])
  // end calculate-target-score-average-timers-per-question

  // begin calculate-target-score-average-time-per-passage
  const sectionCount = getSectionCount(fullExam)
  const avgValues = R.pipe(
    transformExamIntoSectionPayloadByPassages,
    calculateAvgValues('passages')
  )(fullExam)

  const sectionScaledScore = R.pipe(
    R.path(['scores', 'sections']),
    R.pluck('scaled_score')
  )(fullExam)

  const metrics = await fetchCombinedMetrics(examType.id, sectionCount, sectionScaledScore)
  const metricsToSave = processMetricsForUpdate(avgValues)(metrics)

  await mapP(
    upsertExamMetrics(examType.id)
  )(metricsToSave)
  // end calculate-target-score-average-time-per-passage
}

const prepareScores = (examTypeId) => async exam => {
  const type = await findExamType({ id: examTypeId })

  if (!type.score_calculations_enabled || exam.originalExam.score_calculation_method === ScoreCalculationMethod.manufactured) {
    return
  }

  const scores = JSON.parse(exam.scores)
  const mappedSections = await mapSections(examTypeId)(scores.sections)
  const mappedExam = await mapExam(examTypeId, mappedSections)(scores.exam)
  const patchedExam = await patch(exam.id, {
    scores_status: STUDENT_EXAM_SCORE_STATUS_CALCULATED,
    scores: {
      exam: mappedExam,
      sections: mappedSections,
    },
  })
  const allExams = await findAllCompletedExams(exam.exam_type_id)({ id: exam.student_id })
  const PTS = await calculatePTS(allExams)

  await setPTSBySections(exam.exam_type_id, exam.student_id)(PTS)
  await updateExamAvgTimers(type, exam)

  return patchedExam
}

const processBatch = async (batch, _, batchNumber) => {
  log(batchNumber)

  return mapP(
    async exam => prepareScores(exam.exam_type_id)(exam)
  )(batch)
}

const nextBatch = async (batchNumber, step) => R.pipeWith(R.andThen)([
  async () => fetchCustom(
    StudentExam.where({ scores_status: STUDENT_EXAM_SCORE_STATUS_PENDING })
  )(['sections', 'originalExam'], buildPaginationData(batchNumber, step)),
  R.prop('data'),
  collectionToJson,
])(true)

export const calculateStudentExamScores = async (): Promise<void> => {
  await processInBatches(nextBatch, processBatch, RECORDS_PER_BATCH)
}
