import * as R from 'ramda'
import { collectionToJson } from '../../utils/model/collection-to-json'
import { find as findExam } from '../../src/modules/exams/exam-repository'
import { create as createQuestionMetrics } from '../../src/modules/exam-metrics/exam-metrics-repository'
import { create as createQuestionMetricsAvg } from '../../src/modules/exam-metrics-avg/exam-metrics-avg-repository'
import { create as createPassageMetrics } from '../../src/modules/exam-passage-metrics/exam-passage-metrics-repository'
import { create as createPassageMetricsAvg } from '../../src/modules/exam-passage-metrics-avg/exam-passage-metrics-avg-repository'
import mapP from '../../utils/function/mapp'
import { safeDivide } from '../../utils/number/safe-divide'
import { getMinMaxScoresFromType } from '../student-exam-scores/get-min-max-sxores'
import { ExamType } from '../../src/types/exam-type'

type SectionDefinition = {
  section: string,
  amount: number,
  sectionMinutes: number
}

const buildQuestionTimer = order => (
  {
    order,
    timers: {
      checking_sum: 60,
      checking_divisor: 1,
      reading_sum: 60,
      reading_divisor: 1,
      working_sum: 60,
      working_divisor: 1,
      checking_avg: 60,
      reading_avg: 60,
      working_avg: 60,
    },
  }
)

const buildPassageTimer = (order, seconds) => (
  {
    order,
    timers: {
      checking_sum: seconds,
      checking_divisor: 1,
      reading_sum: seconds,
      reading_divisor: 1,
      working_sum: seconds,
      working_divisor: 1,
      checking_avg: seconds,
      reading_avg: seconds,
      working_avg: seconds,
    },
  }
)

const getExamByExamType = async exam_type_id => (
  R.pipeWith(R.andThen)([
    async exam_type_id => findExam({ limit: { take: 1, page: 1 }, order: {} }, { exam_type_id }, ['sections.passages', 'type.scaledScoreDefinitions.template.scores']),
    R.prop('data'),
    collectionToJson,
    R.head,
  ])(exam_type_id)
)

const getExamLength = R.pipe(
  R.prop('exam_length'),
  JSON.parse,
  R.prop('sections')
)

const buildQuestionExamMetrics = (examType: ExamType, sectionOrder: number) => async (sectionDefinition: SectionDefinition) => {
  const metrics = []

  for (let i = 1; i <= sectionDefinition.amount; i++) {
    metrics.push(
      buildQuestionTimer(i)
    )
  }

  const records = []
  const sectionMinMaxScore = getMinMaxScoresFromType(examType, sectionOrder)

  for (let i = sectionMinMaxScore.min; i <= sectionMinMaxScore.max; i++) {
    records.push(
      createQuestionMetrics(examType.id, {
        section_score: i,
        section_order: sectionOrder,
        timings: JSON.stringify(metrics),
      })
    )
  }

  return records
}

const buildQuestionExamMetricsAvg = (examTypeId: string, sectionOrder: number) => async (sectionDefinition: SectionDefinition) => {
  const metrics = []

  for (let i = 1; i <= sectionDefinition.amount; i++) {
    metrics.push(
      buildQuestionTimer(i)
    )
  }

  return createQuestionMetricsAvg(examTypeId, {
    section_order: sectionOrder,
    timings: JSON.stringify(metrics),
  })
}

const calculateSecondsPerPassage = (sectionDefinition, passageAmount) => (
  R.pipe(
    R.prop('sectionMinutes'),
    safeDivide(R.__, passageAmount),
    Math.round,
    R.multiply(60)
  )(sectionDefinition)
)

const buildPassageExamMetrics = (examType: ExamType, sectionOrder: number, exam) => async (sectionDefinition: SectionDefinition) => {
  const passageAmount = exam.sections[sectionOrder - 1].passages.length
  const secondsPerPassage = calculateSecondsPerPassage(sectionDefinition, passageAmount)
  const metrics = []

  for (let i = 1; i <= passageAmount; i++) {
    metrics.push(
      buildPassageTimer(i, secondsPerPassage)
    )
  }

  const records = []
  const sectionMinMaxScore = getMinMaxScoresFromType(examType, sectionOrder)

  for (let i = sectionMinMaxScore.min; i <= sectionMinMaxScore.max; i++) {
    records.push(
      createPassageMetrics(examType.id, {
        section_score: i,
        section_order: sectionOrder,
        timings: JSON.stringify(metrics),
      })
    )
  }

  return records
}

const buildPassageExamMetricsAvg = (examTypeId: string, sectionOrder: number, exam) => async (sectionDefinition: SectionDefinition) => {
  const passageAmount = exam.sections[sectionOrder - 1].passages.length
  const secondsPerPassage = calculateSecondsPerPassage(sectionDefinition, passageAmount)
  const metrics = []

  for (let i = 1; i <= passageAmount; i++) {
    metrics.push(
      buildPassageTimer(i, secondsPerPassage)
    )
  }

  return createPassageMetricsAvg(examTypeId, {
    section_order: sectionOrder,
    timings: JSON.stringify(metrics),
  })
}

const buildAllMetrics = (examType, sectionOrder, exam) => async sectionDefinition => (
  Promise.all([
    buildQuestionExamMetrics(examType, sectionOrder)(sectionDefinition),
    buildQuestionExamMetricsAvg(examType.id, sectionOrder)(sectionDefinition),
    buildPassageExamMetrics(examType, sectionOrder, exam)(sectionDefinition),
    buildPassageExamMetricsAvg(examType.id, sectionOrder, exam)(sectionDefinition),
  ])
)

export const seedTimerMetrics = async examTypeId => {
  const exam = await getExamByExamType(examTypeId)
  const examLength = getExamLength(exam)

  return R.addIndex(mapP)(
    async (sectionDefinition, index: number) => buildAllMetrics(exam.type, index + 1, exam)(sectionDefinition)
  )(examLength)
}
