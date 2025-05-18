import * as R from 'ramda'
import { findOneOrFail } from '../../exam-types/exam-type-repository'
import { fetchStudentExamScoresOrFail, patch } from '../../student-exam-scores/student-exam-scores-repository'
import asAsync from '../../../../utils/function/as-async'
import { findCurrentSectionScore } from '../../../../services/student-exam-scores/find-current-scores'
import { getMinMaxScoresFromTemplate } from '../../../../services/student-exam-scores/get-min-max-sxores'
import { validateScoreValue } from '../validation/validate-score-value'

const setSectionTargetScore = (value, sectionIndex) => R.over(
  R.lensIndex(sectionIndex),
  R.assoc('target_score', value)
)

const sumTargetScores = scores => R.pipe(
  R.pluck('target_score'),
  R.slice(1, Infinity),
  R.sum
)(scores)

const findAndUpdateScore = (value, sectionIndex) => R.over(
  R.lensProp('scores'),
  R.pipe(
    setSectionTargetScore(value, sectionIndex),
    scores => setSectionTargetScore(sumTargetScores(scores), 0)(scores)
  )
)

const patchStudentExamScores = async studentExamScores => (
  patch(studentExamScores.id, {
    is_ts_attached_to_pts: false,
    scores: JSON.stringify(studentExamScores.scores),
  })
)

const validateScoreMinMax = (type, order, value): unknown | never => R.pipe(
  R.propOr([], 'scaledScoreDefinitions'),
  R.find(
    R.propEq('order', order)
  ),
  R.path(['template', 'scores']),
  getMinMaxScoresFromTemplate,
  validateScoreValue(value)
)(type)

export default async (student, payload, examTypeId, sectionOrder) => {
  const order = Number(sectionOrder)
  const type = await findOneOrFail({ id: examTypeId }, ['scaledScoreDefinitions.template.scores'])
  const currentScores = await fetchStudentExamScoresOrFail(student.id, type.id)
  const currentSectionScore = findCurrentSectionScore(order, currentScores)

  if (currentSectionScore === payload.value) {
    // @ts-ignore
    return R.over(R.lensProp('scores'), JSON.parse)(currentScores)
  }

  validateScoreMinMax(type, order, payload.value)

  return R.pipeWith(R.andThen)([
    asAsync(
      // @ts-ignore
      R.over(R.lensProp('scores'), JSON.parse)
    ),
    findAndUpdateScore(payload.value, order),
    patchStudentExamScores,
    R.invoker(0, 'toJSON'),
    R.over(R.lensProp('scores'), JSON.parse),
  ])(currentScores)
}
