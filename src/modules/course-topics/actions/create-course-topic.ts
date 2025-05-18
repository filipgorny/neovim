import { getNextOrderByCourseId } from '../course-topics-repository'
import { createEntity } from '../course-topics-service'

type Payload = {
  topic: string,
  level: number,
}

export default async (course_id: string, payload: Payload) => (
  createEntity({
    course_id,
    order: await getNextOrderByCourseId(course_id),
    ...payload,
  })
)
