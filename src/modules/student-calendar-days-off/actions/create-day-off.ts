import { StudentCourse } from '../../../types/student-course'
import { createDayOff } from '../student-calendar-days-off-service'

type Payload = {
  day_off_date: string
}

export default async (studentCourse: StudentCourse, payload: Payload) => (
  createDayOff({ ...payload, student_course_id: studentCourse.id })
)
