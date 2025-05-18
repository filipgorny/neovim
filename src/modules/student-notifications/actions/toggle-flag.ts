import { patchWhere, findOneOrFail } from '../student-notifications-repository'

export default async (student, id: string) => {
  const notification = await findOneOrFail({ id, student_id: student.id })

  return patchWhere({ id, student_id: student.id }, { is_flagged: !notification.is_flagged })
}
