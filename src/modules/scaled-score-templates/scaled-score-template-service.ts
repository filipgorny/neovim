import R from 'ramda'
import { create, patch, findOne } from './scaled-score-template-repository'
import { deleteRecords, create as createScore } from '../scaled-scores/scaled-score-repository'
import { resourceAlreadyExistsException, throwException } from '../../../utils/error/error-factory'

type Score = {
  correct_answer_amount: number,
  scaled_score: number,
  percentile_rank: number,
}

const throwAlreadyExists = () => throwException(resourceAlreadyExistsException('ScaledScoreTemplate'))

export const createScaledScoreTemplate = async title => (
  create({
    title,
  }).catch(throwAlreadyExists)
)

export const updateScaledScoreTemplate = id => async title => {
  const template = await findOne({
    title,
  })

  R.unless(
    R.isNil,
    R.unless(
      R.propEq('id', id),
      throwAlreadyExists
    )
  )(template)

  return patch(id, {
    title,
  })
}

export const upsertScores = template_id => async (scores: Score[]) => {
  await deleteRecords({ template_id })

  return R.map(createScore(template_id))(scores)
}
