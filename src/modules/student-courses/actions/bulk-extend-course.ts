import { extendLatestCourse } from '../student-course-service'

type Payload = {
  course_id: string
  student_ids: string[]
  days_amount: number
}

export default async (payload: Payload) => {
  for (const student_id of payload.student_ids) {
    await extendLatestCourse(payload.course_id, student_id, payload.days_amount)
  }
}
