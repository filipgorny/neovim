import { patchWhere } from '../student-notifications-repository'

export default async (student) => (
  patchWhere({ student_id: student.id }, { is_read: true })
)
