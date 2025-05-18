import * as R from 'ramda'
import { findOneOrFail } from '../../exam-types/exam-type-repository'
import { fetchStudentExamScoresOrFail, patch } from '../../student-exam-scores/student-exam-scores-repository'
import asAsync from '../../../../utils/function/as-async'
import { findCurrentExamScore } from '../../../../services/student-exam-scores/find-current-scores'
import { getMinMaxScoresFromTemplate } from '../../../../services/student-exam-scores/get-min-max-sxores'
import { validateScoreValue } from '../validation/validate-score-value'

const INCREASE_METHOD = 'increase'
const DECREASE_METHOD = 'decrease'

const isIncreasingMethod = method => () => method === INCREASE_METHOD

const modifySectionTargetScore = (value, sectionIndex) => scores => R.over(
  R.lensIndex(sectionIndex),
  R.assoc('target_score', value)
)(scores)

const sumTargetScores = scores => R.pipe(
  R.pluck('target_score'),
  R.slice(1, Infinity),
  R.sum
)(scores)

const findIndexOfSectionToChange = (method, scores) => R.pipe(
  R.pluck('target_score'),
  R.ifElse(
    isIncreasingMethod(method),
    R.reduce(R.min, Infinity),
    R.reduce(R.max, -Infinity)
  ),
  value => R.findIndex(R.propEq('target_score', value))(scores),
  Number,
  R.inc
)(scores)

const updateSectionScores = value => scores => {
  const currentScore = R.pipe(
    R.head,
    R.prop('target_score'),
    Number
  )(scores)

  if (currentScore === value) return scores

  const method = value > currentScore ? INCREASE_METHOD : DECREASE_METHOD
  const diff = method === INCREASE_METHOD ? R.subtract(value, currentScore) : R.subtract(currentScore, value)
  let finalScores = scores

  for (let i = 0; i < diff; i++) {
    const index = findIndexOfSectionToChange(method, R.reject(R.propEq('order', 0))(finalScores))
    const value = R.pipe(
      R.nth(index),
      R.prop('target_score'),
      Number,
      R.ifElse(
        isIncreasingMethod(method),
        R.inc,
        R.dec
      )
    )(finalScores)

    finalScores = modifySectionTargetScore(value, index)(finalScores)
  }

  return finalScores
}

const findAndUpdateScore = value => scores => R.over(
  R.lensProp('scores'),
  R.pipe(
    updateSectionScores(value),
    scores => modifySectionTargetScore(sumTargetScores(scores), 0)(scores)
  )
)(scores)

const patchStudentExamScores = async studentExamScores => (
  patch(studentExamScores.id, {
    is_ts_attached_to_pts: false,
    scores: JSON.stringify(studentExamScores.scores),
  })
)

const sumByProp = prop => R.pipe(
  R.pluck(prop),
  R.sum,
  R.objOf(prop)
)

const validateScoreMinMax = (type, value): unknown | never => R.pipe(
  R.propOr([], 'scaledScoreDefinitions'),
  R.map(
    R.pipe(
      R.path(['template', 'scores']),
      getMinMaxScoresFromTemplate
    )
  ),
  R.converge(R.merge, [
    sumByProp('min'),
    sumByProp('max'),
  ]),
  validateScoreValue(value)
)(type)

export default async (student, payload, examTypeId) => {
  const type = await findOneOrFail({ id: examTypeId }, ['scaledScoreDefinitions.template.scores'])
  const currentScores = await fetchStudentExamScoresOrFail(student.id, type.id)
  const currentExamScore = findCurrentExamScore(currentScores)

  if (currentExamScore === payload.value) {
    return R.over(R.lensProp('scores'), JSON.parse)(currentScores)
  }

  validateScoreMinMax(type, payload.value)

  return R.pipeWith(R.andThen)([
    asAsync(
      R.over(R.lensProp('scores'), JSON.parse)
    ),
    findAndUpdateScore(payload.value),
    patchStudentExamScores,
    R.invoker(0, 'toJSON'),
    R.over(R.lensProp('scores'), JSON.parse),
  ])(currentScores)
}
