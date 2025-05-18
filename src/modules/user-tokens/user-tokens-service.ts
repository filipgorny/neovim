import issueAuthToken from '../../../services/users/issue-eg-games-auth-token'
import { throwException, userTokenExpiredException } from '../../../utils/error/error-factory'
import { User } from '../../types/user'
import { findUserByEmail } from '../users/users-service'
import { findOneOrFail } from './user-tokens-repository'

const buildResponse = (user: User) => ({
  token: issueAuthToken(user, {
    role: user.user_role,
  })(),
  role: user.user_role,
  email: user.email,
  id: user.id,
  is_email_verified: user.is_email_verified,
  is_active: user.is_active,
  username: user.student.username,
})

export const authUserByToken = async (token: string) => {
  const userToken = await findOneOrFail({ token }, ['user.student'])

  const now = Date.now()
  const expiresAt = new Date(userToken.expires_at).getTime()

  if (expiresAt > now) {
    return buildResponse(userToken.user)
  } else {
    throwException(userTokenExpiredException())
  }
}

export const getTokenByUser = async (user: User) => {
  const userToken = await findOneOrFail({ user_id: user.id })

  const now = Date.now()
  const expiresAt = new Date(userToken.expires_at).getTime()

  if (expiresAt > now) {
    return { token: userToken.token }
  } else {
    throwException(userTokenExpiredException())
  }
}

export const getTokenByStudent = async (student) => {
  const user = await findUserByEmail(student.toJSON().email)

  return getTokenByUser(user)
}
