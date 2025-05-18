import { patchWhere } from '../student-notifications-repository'

export default async (student_id: string) => (
  patchWhere({ student_id }, { is_seen: true })
)
