import { fetchFirst } from '../../../../utils/model/fetch'
import { User } from '../../../models'
import { dispatchPasswordResetNotification } from '../../../models/observers/user-observers'
import validateAccountIsActive from '../validation/validate-account-is-active'
import validateAccountIsVerified from '../validation/validate-account-is-verified'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/reset-password-init-schema'

const setNewPasswordResetToken = async (user, token) => (
  User.where({
    id: user.id,
  }).save({
    password_reset_token: token,
    password_reset_token_created_at: new Date(),
  }, { patch: true })
)

export default async payload => {
  validateEntityPayload(schema)(payload)

  const { email, link, token } = payload
  const user = await fetchFirst(User)({ email })

  validateAccountIsActive(user)
  validateAccountIsVerified(user)

  await setNewPasswordResetToken(user, token)

  try {
    await dispatchPasswordResetNotification(user, link)
  } catch (e) {
    console.log(e)
  }

  return user
}
