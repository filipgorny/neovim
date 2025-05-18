import { findOneOrFail } from '../users-repository'
import { changePassword } from '../users-service'
import validatePassword from '../validation/validate-password'

type Payload = {
  password: string,
}

export default async (user, payload: Payload) => {
  const password = payload.password
  const instance = await findOneOrFail({ id: user.id })

  validatePassword(password)

  return changePassword(instance, password)
}
