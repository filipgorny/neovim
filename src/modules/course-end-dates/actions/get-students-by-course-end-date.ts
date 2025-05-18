import { getStudentsByEndDate } from '../course-end-dates-service'

type Payload = {
  end_date: string
}

export default async (course_id: string, payload: Payload) => (
  getStudentsByEndDate(course_id, payload.end_date)
)
