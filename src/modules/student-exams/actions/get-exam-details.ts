import R from 'ramda'
import { findOneOrFail } from '../student-exam-repository'
import { flattenQuestions } from '../../../../services/student-exams/flatten-questions'
import asAsync from '../../../../utils/function/as-async'
import { findOne } from '../../exams/exam-repository'
import { fetchStudentExamScores } from '../../student-exam-scores/student-exam-scores-repository'
import { stitchArraysByProp } from '../../../../utils/array/stitch-arrays-by-prop'

const findExam = student => async id => (
  findOneOrFail({
    student_id: student.id,
    id,
  }, ['sections.passages.questions', 'layout', 'originalExam'])
)

const extractState = R.applySpec({
  exam_seconds_left: R.pipe(
    R.prop('exam_seconds_left'),
    JSON.parse
  ),
  current_page: R.prop('current_page'),
})

const getExamType = R.pipeWith(R.andThen)([
  asAsync(R.prop('exam_id')),
  async examId => findOne({
    id: examId,
  }, ['type.scaledScoreDefinitions.template.scores', 'type.introPages']),
  R.prop('type'),
  R.omit(['id', 'break_definition']),
])

const findScaledScore = (order, score) => R.pipe(
  R.find(R.propEq('order', order)),
  R.pathOr([], ['template', 'scores']),
  R.find(R.propEq('scaled_score', score))
)

const getPercentiles = scaledScoreDefinitions => section => {
  const score = Number(section.target_score)
  const sectionScaledScore = findScaledScore(section.order, score)(scaledScoreDefinitions)

  return {
    target_score: score,
    percentile_rank: R.propOr('-', 'percentile_rank')(sectionScaledScore),
    correct_answer_amount: R.propOr(0, 'correct_answer_amount')(sectionScaledScore),
  }
}

const sumProp = prop => R.pipe(
  R.pluck(prop),
  R.sum
)

const getExamPercentileRank = (scaledScore, template) => R.pathOr('-', [scaledScore, 'percentile'])(template)

const appendExamTS = examScaledScoreTemplate => scores => {
  const TS = sumProp('target_score')(scores)
  const PTS = sumProp('pts')(scores)
  const correctAnswerAmount = sumProp('correct_answer_amount')(scores)
  const percentileRank = getExamPercentileRank(TS, examScaledScoreTemplate)

  return R.append({
    id: null,
    title: 'Total',
    name: 'total',
    order: 0,
    target_score: TS,
    pts: PTS,
    percentile_rank: percentileRank,
    correct_answer_amount: correctAnswerAmount,
  })(scores)
}

const prepareScoreProjection = (scores, scaledScoreDefinitions, sections, examScaledScoreTemplate) => () => R.pipe(
  R.prop('scores'),
  JSON.parse,
  stitchArraysByProp('order', R.__, sections),
  // @ts-ignore
  R.reject(section => section.order === 0),
  R.map(
    R.pipe(
      R.juxt([
        R.pick(['id', 'title', 'order', 'pts', 'name', 'target_score']),
        getPercentiles(scaledScoreDefinitions),
      ]),
      R.mergeAll
    )
  ),
  appendExamTS(examScaledScoreTemplate)
  // @ts-ignore
)(scores)

const getIntoPageFromType = (order: number, type) => R.pipe(
  R.prop('introPages'),
  R.find(R.propEq('order', order))
)(type)

export default async (student, id) => {
  const exam = await findExam(student)(id)
  const type = await getExamType(exam)
  const studentExamScores = await fetchStudentExamScores(student.id, exam.exam_type_id)
  // @ts-ignore
  const scaledScoreDefinitions = R.prop('scaledScoreDefinitions')(type)
  // @ts-ignore
  const examScaledScoreTemplate = JSON.parse(type.exam_scaled_score_template)
  const sections = R.pipe(
    flattenQuestions,
    R.map(
      section => R.assoc(
        'intro_page_content',
        getIntoPageFromType(section.order, type)
      )(section)
    )
  )(exam)

  return R.applySpec({
    exam: R.omit(['exam_length', 'sections', 'exam_seconds_left', 'current_page', 'layout']),
    state: extractState,
    type: R.always(
      R.omit(
        ['introPages']
      )(type)
    ),
    layout: R.prop('layout'),
    score_projection: prepareScoreProjection(studentExamScores, scaledScoreDefinitions, exam.sections, examScaledScoreTemplate),
    questions: R.always(sections),
  })(exam)
}
