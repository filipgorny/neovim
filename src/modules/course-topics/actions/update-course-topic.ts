import { patchEntity } from '../course-topics-service'

type Payload = {
  topic: string,
  level: number,
}

export default async (course_id: string, id: string, payload: Payload) => (
  patchEntity(id, payload)
)
