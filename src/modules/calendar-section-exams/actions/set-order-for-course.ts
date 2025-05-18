import { setOrderForCourse } from '../calendar-section-exams-service'

type Payload = {
  course_id: string,
  exam_ids: string[],
}

export default async (payload: Payload) => (
  setOrderForCourse(payload.course_id, payload.exam_ids)
)
