import { extendLatestCourse } from '../student-course-service'

type Payload = {
  course_id: string
  student_id: string
  days_amount: number
}

export default async (payload: Payload) => (
  extendLatestCourse(payload.course_id, payload.student_id, payload.days_amount)
)
