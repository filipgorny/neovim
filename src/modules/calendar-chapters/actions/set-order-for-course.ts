import { setOrderForCourse } from '../calendar-chapters-service'

type Payload = {
  course_id: string,
  chapter_ids: string[],
}

export default async (payload: Payload) => (
  setOrderForCourse(payload.course_id, payload.chapter_ids)
)
