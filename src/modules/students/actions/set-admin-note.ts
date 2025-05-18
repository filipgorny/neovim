import { findOne } from '../student-repository'
import { setAdminNote } from '../student-service'

export default async (id: string, payload: any) => {
  const student = await findOne({ id })

  return setAdminNote(student.id, payload.admin_note)
}
