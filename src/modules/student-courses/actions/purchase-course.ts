import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import { findStudentByExternalId, getStudentByLikiRequest } from '../../students/student-service'
import { StudentCourseTypes } from '../student-course-types'
import { schema } from '../validation/schema/purchase-course-token-payload-schema'
import { purchaseCourse } from '../student-course-service'
import { patch, upsert } from '../../students/student-repository'
import { getSetting } from '../../settings/settings-service'
import { Settings } from '../../settings/settings'

export type Payload = {
  transaction_id: string,
  external_id: string,
  external_created_at: string,
  type: StudentCourseTypes,
  metadata: any
}

export default async (request, payload: Payload) => {
  console.log({ payload })
  const student = await getStudentByLikiRequest(request)
  await purchaseCourse(student, payload)
}
