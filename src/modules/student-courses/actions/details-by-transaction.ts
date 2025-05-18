import * as R from 'ramda'
import { find } from '../student-course-repository'
import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import { customException, notFoundException, throwException } from '@desmart/js-utils'
import { collectionToJson } from '../../../../utils/model/collection-to-json'
import { findOne as findStudent } from '../../students/student-repository'
import { getStudentByLikiRequest } from '../../students/student-service'
import logger from '../../../../services/logger/logger'

export const findByExternalId = (externalId: string) => R.find(
  studentCourse => studentCourse.original.external_id.split(',').includes(externalId)
)

export const findCoursesByTransactionId = async (transactionId: string) => (
  R.pipeWith(R.andThen)([
    async transaction_id => find({ limit: { page: 1, take: 100 }, order: { by: 'external_created_at', dir: 'asc' } }, { transaction_id }, ['original']),
    R.prop('data'),
    collectionToJson,
  ])(transactionId)
)

export const validateCourseBelongsToStudent = (student, course) => {
  if (student.id !== course.student_id) {
    logger.error('Student does not have access to this course', { student, course })
    throwException(customException('student-course.invalid-student', 403, 'Course does not belong to student'))
  }
}

export default async (request, external_id: string, transaction_id: string) => {
  const student = await getStudentByLikiRequest(request)
  const courses = await findCoursesByTransactionId(transaction_id)

  const course = findByExternalId(external_id)(courses)

  if (!course) {
    throwException(notFoundException('student-course'))
  }

  validateCourseBelongsToStudent(student, course)

  return course
}
