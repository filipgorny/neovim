import { setTimezone } from '../student-service'

type Payload = {
  timezone: string
}

export default async (student_id: string, payload: Payload) => (
  setTimezone(student_id, payload.timezone)
)
