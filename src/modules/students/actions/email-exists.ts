import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import { schema } from '../validation/schema/email-exists-auth-token-schema'
import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import { findOneWithoutDeleted } from '../student-repository'

export default async (request) => {
  const tokenPayload = await getPayloadFromLikiRequestToken(request)

  validateEntityPayload(schema)(tokenPayload)

  const email = tokenPayload.email.toLowerCase()

  const student = await findOneWithoutDeleted({ email })

  return { email_exists: !!student }
}
