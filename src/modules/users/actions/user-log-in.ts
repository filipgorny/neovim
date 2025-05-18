import { User } from '../../../models'
import validateAccountIsActive from '../validation/validate-account-is-active'
import validateAccountIsVerified from '../validation/validate-account-is-verified'
import validatePasswordIsCorrect from '../validation/validate-password-is-correct'
import issueAuthToken from '../../../../services/users/issue-eg-games-auth-token'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/user-log-in-schema'
import { throwException, notFoundException } from '../../../../utils/error/error-factory'

export default async payload => {
  validateEntityPayload(schema)(payload)

  let user

  try {
    user = (await User.where({ email: payload.email }).fetch({ withRelated: ['student'] })).toJSON()
  } catch (e) {
    throwException(notFoundException('User'))
  }

  validateAccountIsActive(user)
  validateAccountIsVerified(user)
  validatePasswordIsCorrect(user, payload.password)

  return {
    token: issueAuthToken(user, {
      role: user.user_role,
    })(),
    role: user.user_role,
    email: user.email,
    id: user.id,
    is_email_verified: user.is_email_verified,
    is_active: user.is_active,
    username: user.student.username,
  }
}
