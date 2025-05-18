import { findOneOrFail } from '../scaled-score-template-repository'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/upsert-scores-schema'
import { upsertScores } from '../scaled-score-template-service'

export default async (id, payload) => {
  validateEntityPayload(schema)(payload)

  const template = await findOneOrFail({ id })

  return upsertScores(id)(payload.scores)
}
