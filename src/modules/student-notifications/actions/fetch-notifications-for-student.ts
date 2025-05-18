import { patchWhere } from '../student-notifications-repository'
import { fetchNotificationsByStudentId } from '../student-notifications-service'

export default async (student_id: string, user, limit?: { page: number, take: number }) => (
  fetchNotificationsByStudentId(student_id, limit)
)
