import { setAccessibleTo } from '../student-course-service'

type Payload = {
  accessible_to: string,
}

export default async (id: string, payload: Payload) => (
  setAccessibleTo(id, payload.accessible_to)
)
