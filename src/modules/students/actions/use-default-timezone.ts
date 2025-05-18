import { useDefaultTimezone } from '../student-service'

export default async (student_id: string) => (
  useDefaultTimezone(student_id)
)
