import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import { upsertByExternalId } from '../student-repository'
import { schema } from '../validation/schema/upsert-with-liki-id-schema'

export default async request => {
  const payload = await getPayloadFromLikiRequestToken(request)

  validateEntityPayload(schema)(payload)

  const email = payload.email.toLowerCase()
  const { external_student_id, name, phone_number } = payload

  await upsertByExternalId(external_student_id, email, name, phone_number)
}
