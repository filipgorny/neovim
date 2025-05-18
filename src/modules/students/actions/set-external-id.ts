import { customException, throwException } from '../../../../utils/error/error-factory'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import { findOne, setExternalId } from '../student-repository'
import { findStudentByEmail } from '../student-service'
import { schema } from '../validation/schema/set-liki-id-schema'

export default async request => {
  const payload = await getPayloadFromLikiRequestToken(request)

  validateEntityPayload(schema)(payload)

  const { external_student_id } = payload
  const email = payload.email.toLowerCase()

  const student = await findStudentByEmail(email)

  if (student.external_id !== null && student.external_id !== external_student_id) {
    throwException(customException('students.external-id.already-assigned', 403, 'This student already has external id assigned'))
  }

  const student2 = await findOne({ external_id: external_student_id })

  if (student2 && student2.id !== student.id) {
    throwException(customException('students.external-id.already-exists', 403, 'This external id has already been used'))
  }

  await setExternalId(student.id, external_student_id)
}
