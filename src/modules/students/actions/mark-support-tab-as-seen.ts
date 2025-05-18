import { markSupportTabSeen } from '../student-service'

export default async (student) => (
  markSupportTabSeen(student.id)
)
