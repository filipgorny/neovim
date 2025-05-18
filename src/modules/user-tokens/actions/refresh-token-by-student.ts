import { findUserByEmail } from '../../users/users-service'
import refreshTokenByUser from './refresh-token-by-user'

export default async (student) => {
  console.log('refresh token by student ', student.toJSON().email)
  const user = await findUserByEmail(student.toJSON().email)

  return refreshTokenByUser(user)
}
