import { findOne } from '../student-repository'
import { freezeAccount } from '../student-service'

export default async (id: string, payload: { freeze_reason: string }) => {
  const student = await findOne({ id })

  return freezeAccount(student.id, payload.freeze_reason)
}
