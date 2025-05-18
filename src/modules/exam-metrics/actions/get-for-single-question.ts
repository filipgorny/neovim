import * as R from 'ramda'
import { findOneOrFail } from '../../student-exam-questions/student-exam-question-repository'
import { findOneOrFail as findExam } from '../../student-exams/student-exam-repository'
import { validateQuestionBelongsToStudent } from '../../student-exam-questions/validation/validate-question-belongs-to-student'
import { validateExamIsCompleted } from '../../student-exams/validation/validate-exam-is-complete'
import { flattenQuestionsCustom } from '../../../../services/student-exams/flatten-questions'
import { findOne as findStudentScores } from '../../student-exam-scores/student-exam-scores-repository'
import { wrapProps } from '../../../../utils/object/wrap-props'
import { findOneOrFail as findOriginalQuestion } from '../../exam-questions/exam-question-repository'
import { findOne as findOriginalExam } from '../../exams/exam-repository'
import { findOne as findQuestionTimeMetrics, find as findQuestionTimeMetricsForExam } from '../../exam-question-time-metrics/exam-question-time-metrics-repository'
import { findOne as findPassageTimeMetrics, find as findPassageTimeMetricsForExam } from '../../exam-passage-time-metrics/exam-passage-time-metrics-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'

const extractTimers = R.pipe(
  R.prop('timers'),
  JSON.parse,
  R.map(
    wrapProps('timers', ['reading', 'working', 'checking'])
  )
)

const findMax = (resourceType, metricType) => R.pipe(
  R.filter(
    R.propEq('resource_type', resourceType)
  ),
  // @ts-ignore
  R.pluck('timers'),
  R.sortBy(
    R.prop(metricType)
  ),
  R.last,
  R.prop(metricType),
  R.objOf(`max_${resourceType}_${metricType}`)
)

const getStudentsQuestionTimers = question => R.pipe(
  extractTimers,
  // @ts-ignore
  R.juxt([
    R.pipe(
      // @ts-ignore
      R.prop(question.original_exam_question_id),
      R.prop('timers'),
      R.objOf('timers')
    ),
    // @ts-ignore
    R.pipe(
      R.values,
      R.juxt([
        findMax('question', 'working'),
        findMax('question', 'checking'),
      ]),
      // @ts-ignore
      R.mergeAll
    ),
  ]),
  // @ts-ignore
  R.mergeAll
)

const getStudentsPassageTimers = question => R.pipe(
  extractTimers,
  // @ts-ignore
  R.juxt([
    R.pipe(
      // @ts-ignore
      R.prop(question.passage.original_exam_passage_id),
      R.prop('timers'),
      R.objOf('timers')
    ),
    // @ts-ignore
    R.pipe(
      R.values,
      R.juxt([
        findMax('passage', 'reading'),
        findMax('passage', 'working'),
        findMax('passage', 'checking'),
      ]),
      // @ts-ignore
      R.mergeAll
    ),
  ]),
  // @ts-ignore
  R.mergeAll
)

const findScores = (student, exam_type_id) => async exam => (
  findStudentScores({
    exam_type_id,
    student_id: student.id,
  })
)

const getStudentsTS = async (exam, student, exam_type_id, section_order) => (
  R.pipeWith(R.andThen)([
    findScores(student, exam_type_id),
    R.prop('scores'),
    JSON.parse,
    R.find(
      R.propEq('order', section_order)
    ),
    R.prop('target_score'),
  ])(exam)
)

const getAvgMetricsFromOriginalItem = R.ifElse(
  R.isNil,
  R.always({ timers: null }),
  R.pipe(
    R.pick(['checking_avg', 'working_avg', 'reading_avg']),
    R.objOf('timers')
  )
)

const getMaxFromTimers = prop => timers => (
  R.pipe(
    R.sort(
      R.descend(R.prop(prop))
    ),
    R.head,
    R.prop(prop)
  )(timers)
)

const getMaxAvgValuesForQuestionFromExam = exam => {
  const flatSections = flattenQuestionsCustom(exam, {
    withOriginalQuestions: true,
    questionDecorator: R.pipe(
      R.prop('originalQuestion'),
      R.pick(['reading_avg', 'working_avg', 'checking_avg']),
      R.objOf('original_question_timers')
    ),
  })

  const questionTimers = R.pipe(
    R.pluck('questions'),
    R.flatten,
    // @ts-ignore
    R.pluck('original_question_timers'),
    R.reject(
      R.propSatisfies(Number.isNaN, 'reading_avg')
    )
    // @ts-ignore
  )(flatSections)

  return {
    max_reading_avg: getMaxFromTimers('reading_avg')(questionTimers),
    max_working_avg: getMaxFromTimers('working_avg')(questionTimers),
    max_checking_avg: getMaxFromTimers('checking_avg')(questionTimers),
  }
}

const getMaxAvgValuesForPassages = passages => {
  const cleanPassages = rejectPassagesWithNaN(passages)

  return {
    max_reading_avg: getMaxFromTimers('reading_avg')(cleanPassages),
    max_working_avg: getMaxFromTimers('working_avg')(cleanPassages),
    max_checking_avg: getMaxFromTimers('checking_avg')(cleanPassages),
  }
}

const findOriginalPassages = async id => {
  const exam = await findOriginalExam({ id }, ['sections.passages'])

  return R.pipe(
    R.prop('sections'),
    // @ts-ignore
    R.pluck('passages'),
    R.flatten
    // @ts-ignore
  )(exam)
}

const rejectPassagesWithNaN = R.reject(
  R.propSatisfies(Number.isNaN, 'reading_avg')
)

const getFirstMaxMetric = metricName => R.pipe(
  R.prop('data'),
  collectionToJson,
  // @ts-ignore
  R.reject(
    R.propSatisfies(Number.isNaN, 'reading_avg')
  ),
  R.head,
  R.prop(metricName)
)

const getMaxQuestionMetrics = metricName => async (exam_id, section_score) => {
  const metrics = await findQuestionTimeMetricsForExam({ limit: { page: 1, take: 1 }, order: { by: metricName, dir: 'desc' } }, { exam_id, section_score })

  return getFirstMaxMetric(metricName)(metrics)
}

const getMaxPassageMetrics = metricName => async (exam_id, section_score) => {
  const metrics = await findPassageTimeMetricsForExam({ limit: { page: 1, take: 1 }, order: { by: metricName, dir: 'desc' } }, { exam_id, section_score })

  return getFirstMaxMetric(metricName)(metrics)
}

const getMaxQuestionMetricsValues = async (exam_id, section_score) => {
  const [maxReading, maxChecking, maxWorking] = await Promise.all([
    getMaxQuestionMetrics('reading_avg')(exam_id, section_score),
    getMaxQuestionMetrics('checking_avg')(exam_id, section_score),
    getMaxQuestionMetrics('working_avg')(exam_id, section_score),
  ])

  return {
    max_reading_avg: maxReading,
    max_checking_avg: maxChecking,
    max_working_avg: maxWorking,
  }
}

const getMaxPassageMetricsValues = async (exam_id, section_score) => {
  const [maxReading, maxChecking, maxWorking] = await Promise.all([
    getMaxPassageMetrics('reading_avg')(exam_id, section_score),
    getMaxPassageMetrics('checking_avg')(exam_id, section_score),
    getMaxPassageMetrics('working_avg')(exam_id, section_score),
  ])

  return {
    max_reading_avg: maxReading,
    max_checking_avg: maxChecking,
    max_working_avg: maxWorking,
  }
}

export default async (student, question_id) => {
  const question = await findOneOrFail({ id: question_id }, ['passage.section.exam'])
  const exam = R.path(['passage', 'section', 'exam'])(question)

  validateQuestionBelongsToStudent(student.id)(question)
  validateExamIsCompleted(exam)

  // @ts-ignore
  const examWithQuestions = await findExam({ id: exam.id }, ['sections.passages.questions.originalQuestion', 'originalExam'])

  const section_order = R.path(['passage', 'section', 'order'])(question)
  const exam_type_id = R.path(['originalExam', 'exam_type_id'])(examWithQuestions)

  const studentTS = await getStudentsTS(exam, student, exam_type_id, section_order)

  const originalQuestion = await findOriginalQuestion({ id: question.original_exam_question_id }, ['passage'])
  const originalPassage = R.prop('passage')(originalQuestion)
  // @ts-ignore
  const originalPassages = await findOriginalPassages(exam.exam_id)

  // @ts-ignore
  const studentsQuestionMetrics = getStudentsQuestionTimers(question)(examWithQuestions)
  // @ts-ignore
  const studentsPassageMetrics = getStudentsPassageTimers(question)(examWithQuestions)

  const questionTimeMetrics = await findQuestionTimeMetrics({ exam_question_id: question.original_exam_question_id, section_score: studentTS })

  // @ts-ignore
  const maxQuestionTimeMetricsForExam = await getMaxQuestionMetricsValues(exam.exam_id, studentTS)

  // @ts-ignore
  const passageTimeMetrics = await findPassageTimeMetrics({ exam_passage_id: originalPassage.id, section_score: studentTS })

  // @ts-ignore
  const maxPassageTimeMetricsForExam = await getMaxPassageMetricsValues(exam.exam_id, studentTS)

  return {
    questionMetricsAvg: {
      ...getAvgMetricsFromOriginalItem(originalQuestion),
      ...getMaxAvgValuesForQuestionFromExam(examWithQuestions),
    },
    passageMetricsAvg: {
      ...getAvgMetricsFromOriginalItem(originalPassage),
      ...getMaxAvgValuesForPassages(originalPassages),
    },
    questionMetrics: {
      ...getAvgMetricsFromOriginalItem(questionTimeMetrics),
      ...maxQuestionTimeMetricsForExam,
    },
    passageMetrics: {
      ...getAvgMetricsFromOriginalItem(passageTimeMetrics),
      ...maxPassageTimeMetricsForExam,
    },
    studentsQuestionMetrics,
    studentsPassageMetrics,
  }
}
