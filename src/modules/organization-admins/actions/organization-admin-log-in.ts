import validateAccountIsActive from '../validation/validate-account-is-active'
import validatePasswordIsCorrect from '../validation/validate-password-is-correct'
import { validateAdminNotFound } from '../validation/validate-admin-not-found'
import issueAuthToken from '../../../../services/users/issue-auth-token'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/user-log-in-schema'
import { findOneByEmail } from '../organization-admins-repository'

export default async payload => {
  validateEntityPayload(schema)(payload)

  // The password is always wiped from the user's instance, but we need it to auth the user
  const user = await findOneByEmail(payload.email, {
    columns: ['password as __password', '*'],
  })

  validateAdminNotFound(user)
  validateAccountIsActive(user)

  user.password = user.__password

  validatePasswordIsCorrect(user, payload.password)

  return {
    token: issueAuthToken(user, { role: 'organization-admin' })(),
    email: user.email,
    id: user.id,
    is_active: user.is_active,
  }
}
