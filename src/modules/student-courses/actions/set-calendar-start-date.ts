import { findOneOrFail } from '../student-courses-repository'
import { setCalendarStartDate } from '../student-course-service'

type Payload = {
  calendar_start_at: string,
}

export default async (student, courseId: string, payload: Payload) => {
  const { calendar_start_at } = payload

  const course = await findOneOrFail({ id: courseId, student_id: student.id })

  return setCalendarStartDate(course.id, calendar_start_at)
}
