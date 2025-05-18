import { resetGettingStarted } from '../../../students/student-service'

type Payload = {
  student_id: string,
}

export default async (payload: Payload) => (
  resetGettingStarted(payload.student_id)
)
