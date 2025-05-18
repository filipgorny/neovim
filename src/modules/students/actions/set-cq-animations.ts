import { setCqAnimations } from '../student-service'

type Payload = {
  cq_animations_enabled: boolean,
}

export default async (student, payload: Payload) => (
  setCqAnimations(student.id, payload.cq_animations_enabled)
)
