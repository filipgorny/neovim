import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/create-scaled-score-template-schema'
import { createScaledScoreTemplate } from '../scaled-score-template-service'

export default async payload => {
  validateEntityPayload(schema)(payload)

  return createScaledScoreTemplate(payload.title.trim())
}
