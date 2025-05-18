import * as R from 'ramda'
import { find } from '../../exam-scores/exam-scores-repository'
import { findOneOrFail } from '../exam-repository'
import { find as findStudentExams } from '../../student-exams/student-exam-repository'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { STUDENT_EXAM_STATUS_COMPLETED } from '../../student-exams/student-exam-statuses'

const float = num => parseFloat(num).toFixed(2)

const calculatePercentage = (a, b) => (
  b === 0 ? 0 : float(a * 100 / b)
)

const findScores = async (exam_id: string) => (
  find({ limit: { page: 1, take: 100 }, order: { dir: 'asc', by: 'score' } }, {
    exam_id,
  })
)

const calculateMinExamScore = R.pipe(
  R.pluck('score_min'),
  R.sum
)

const calculateMaxExamScore = R.pipe(
  R.pluck('score_max'),
  R.sum
)

const calculateExamMinMaxScores = R.pipe(
  R.prop('sections'),
  R.applySpec({
    exam_score_min: calculateMinExamScore,
    exam_score_max: calculateMaxExamScore,
  })
)

const validateAllSectionsHaveScores = R.pipe(
  R.prop('sections'),
  R.pluck('scores'),
  R.applySpec({
    can_set_exam_scores: R.all(
      R.pipe(
        R.isEmpty,
        R.not
      )
    ),
  })
)

const findStudentExamsForScores = async (exam_id: string) => (
  findStudentExams(
    { limit: { take: 1000, page: 1 }, order: {} },
    {
      status: STUDENT_EXAM_STATUS_COMPLETED,
      exam_id,
    }
  )
)

const extractAndGroupExamScores = R.pipe(
  R.pluck('scores'),
  R.map(JSON.parse),
  R.pluck('exam'),
  R.groupBy(
    R.prop('scaled_score')
  ),
  R.mapObjIndexed(
    (items, key) => R.length(items)
  )
)

const getExamCount = R.pipe(
  R.values,
  R.sum
)

const buildScoreGraph = (min, max, total) => scores => {
  const data = []

  for (let i = min; i <= max; i++) {
    const value = scores[i] || 0

    data.push({
      score: i,
      percentage: calculatePercentage(value, total),
    })
  }

  return data
}

export default async (exam_id: string) => {
  const scores = await R.pipeWith(R.andThen)([
    findScores,
    R.prop('data'),
  ])(exam_id)

  const exam = await findOneOrFail({ id: exam_id }, ['sections.scores'])
  const studentExams = await R.pipeWith(R.andThen)([
    findStudentExamsForScores,
    R.prop('data'),
    collectionToJson,
  ])(exam_id)

  const studentScoreDistribution = extractAndGroupExamScores(studentExams)
  const examCount = getExamCount(studentScoreDistribution)
  const examMinMaxScores = calculateExamMinMaxScores(exam)
  const student_scores = buildScoreGraph(examMinMaxScores.exam_score_min, examMinMaxScores.exam_score_max, examCount)(studentScoreDistribution)

  return {
    ...exam,
    ...examMinMaxScores,
    ...validateAllSectionsHaveScores(exam),
    scores,
    student_scores,
  }
}
