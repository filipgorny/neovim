import { User } from '../../../types/user'

export default async user => {
  user.password = null
  user.password_reset_token = null
  user.email_verification_token = null

  return user
}
