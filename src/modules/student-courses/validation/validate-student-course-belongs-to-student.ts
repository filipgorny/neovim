import moment from 'moment'
import { unauthorizedException, throwException } from '../../../../utils/error/error-factory'
import { findOneOrFail } from '../student-course-repository'

export const validateStudentCourseBelongsToStudent = async (student_id, student_course_id) => {
  try {
    await findOneOrFail({ id: student_course_id, student_id })
  } catch (err) {
    throwException(unauthorizedException('This student course does not belong to the currently authenticated user'))
  }
}
