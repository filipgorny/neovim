import { findOneOrFail } from '../../students/student-repository'
import { dispatchVerificationCodeAsAdmin } from '../student-two-factor-authentication-service'

export default async (id: string) => {
  const student = await findOneOrFail({ id })

  return dispatchVerificationCodeAsAdmin(student)
}
