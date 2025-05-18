import { patchWhere } from '../student-notifications-repository'

export default async (student, id: string) => (
  patchWhere({ id, student_id: student.id }, { is_read: true })
)
