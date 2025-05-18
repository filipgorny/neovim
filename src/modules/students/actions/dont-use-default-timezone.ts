import { dontUseDefaultTimezone } from '../student-service'

export default async (student_id: string) => (
  dontUseDefaultTimezone(student_id)
)
