import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/create-scaled-score-template-schema'
import { updateScaledScoreTemplate } from '../scaled-score-template-service'

export default async (id, payload) => {
  validateEntityPayload(schema)(payload)

  return updateScaledScoreTemplate(id)(payload.title)
}
