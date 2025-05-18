import { validateDateIsFromFuture } from '../validation/validate-date-is-from-future'
import { findOneOrFail, patch } from '../student-courses-repository'
import { setExpectedEndDate } from '../student-course-service'

type Payload = {
  expected_end_date?: string,
}

export default async (student, courseId: string, payload: Payload) => {
  const { expected_end_date } = payload

  if (expected_end_date) {
    validateDateIsFromFuture(expected_end_date)
  }

  const course = await findOneOrFail({ id: courseId, student_id: student.id })

  return setExpectedEndDate(course.id, expected_end_date)
}
