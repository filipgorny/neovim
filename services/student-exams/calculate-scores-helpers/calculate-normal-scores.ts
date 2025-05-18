import * as R from 'ramda'
import { findOne as findOnePercentile } from '../../../src/modules/percentile-ranks/percentile-rank-repository'
import { fetchExamTypeTemplatesWithScores } from '../../../src/modules/exam-type-scaled-score-templates/exam-type-scaled-score-template-repository'

const getScaledScore = (percentileRank, templateScores) => R.pipe(
  R.filter(score => Number(score.percentile_rank) <= Number(percentileRank)),
  R.sortWith([
    R.descend(R.prop('scaled_score')),
  ]),
  R.head
)(templateScores)

const findScaledScoreTemplateScores = order => examTypeTemplates => R.pipe(
  R.find(
    R.propEq('order', order)
  ),
  R.pathOr([], ['template', 'scores'])
)(examTypeTemplates)

export const calculateNormalScores = async (sectionScore, examTypeId) => {
  const examTypeTemplates = await fetchExamTypeTemplatesWithScores(examTypeId)
  const templateScores = findScaledScoreTemplateScores(sectionScore.order)(examTypeTemplates)
  const percentile = await findOnePercentile({
    exam_type_id: examTypeId,
    section_order: sectionScore.order,
    correct_answer_amount: sectionScore.amount_correct,
  })
  const scaledScore = percentile ? getScaledScore(percentile.percentile_rank, templateScores) : 0

  return {
    ...sectionScore,
    scaled_score: R.propOr(118, 'scaled_score', scaledScore),
    percentile_rank: R.propOr(0, 'percentile_rank', percentile),
  }
}
