import R from 'ramda'
import { findOneOrFail } from '../../exam-types/exam-type-repository'
import { fetchStudentExamScores } from '../../student-exam-scores/student-exam-scores-repository'

const extractQuestionAmount = R.pipe(
  R.prop('question_amount'),
  JSON.parse,
  R.values,
  R.sum
)

const findScaledScore = (order, score) => scaledScoreDefinitions => R.pipe(
  R.find(R.propEq('order', order)),
  // @ts-ignore
  R.pathOr([], ['template', 'scores']),
  R.find(R.propEq('scaled_score', score))
  // @ts-ignore
)(scaledScoreDefinitions)

const getPercentiles = scaledScoreDefinitions => score => {
  const TS = Number(score.target_score)
  const sectionScaledScore = findScaledScore(score.order, TS)(scaledScoreDefinitions)

  return {
    percentile_rank: R.propOr('-', 'percentile_rank')(sectionScaledScore),
    correct_answer_amount: R.propOr(0, 'correct_answer_amount')(sectionScaledScore),
  }
}

const sumProp = prop => R.pipe(
  R.pluck(prop),
  R.sum
)

const getExamPercentileRank = (scaledScore, template) => R.pathOr('-', [scaledScore, 'percentile'])(template)
const getExamCorrectAnswerAmount = (scaledScore, template) => R.pathOr('-', [scaledScore, 'correct_answers'])(template)

const appendExamTS = (scores, examScaledScoreTemplate) => list => {
  const SS = JSON.parse(scores.scores)
  const TS = SS[0].target_score
  const PTS = SS[0].pts
  const correctAnswerAmount = getExamCorrectAnswerAmount(TS, examScaledScoreTemplate)
  const percentileRank = getExamPercentileRank(TS, examScaledScoreTemplate)

  return R.append({
    id: null,
    name: 'total',
    order: 0,
    target_score: TS,
    pts: PTS,
    // fixme: calculate the percentile ranks for exams as well
    percentile_rank: percentileRank,
    correct_answer_amount: correctAnswerAmount,
  })(list)
}

const prepareScoreProjection = (scores, scaledScoreDefinitions, examScaledScoreTemplate) => R.pipe(
  R.prop('scores'),
  JSON.parse,
  // @ts-ignore
  R.reject(section => section.order === 0),
  R.map(
    R.pipe(
      R.juxt([
        R.pick(['id', 'order', 'pts', 'name', 'target_score']),
        getPercentiles(scaledScoreDefinitions),
      ]),
      R.mergeAll
    )
  ),
  appendExamTS(scores, examScaledScoreTemplate)
  // @ts-ignore
)(scores)

export default async (student, examTypeId) => {
  const type = await findOneOrFail({ id: examTypeId }, ['scaledScoreDefinitions.template.scores'])
  const studentExamScores = await fetchStudentExamScores(student.id, type.id)
  const scaledScoreDefinitions = type.scaledScoreDefinitions
  const examScaledScoreTemplate = JSON.parse(type.exam_scaled_score_template)

  return {
    all_question_amount: extractQuestionAmount(type),
    score_projection: prepareScoreProjection(studentExamScores, scaledScoreDefinitions, examScaledScoreTemplate),
  }
}
