import * as R from 'ramda'
import { getCourseEndDates } from '../course-end-dates-service'
import { schema } from '../../student-courses/validation/schema/purchase-course-token-payload-schema'
import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import { findStudentByExternalId, getStudentByLikiRequest } from '../../students/student-service'

export default async (request, course_id: string, query: { order: { by: string, dir: 'asc' | 'desc' } }) => {
  await getStudentByLikiRequest(request)

  const result = await getCourseEndDates(course_id, query)
  return R.map(R.prop('end_date'))(result)
}
