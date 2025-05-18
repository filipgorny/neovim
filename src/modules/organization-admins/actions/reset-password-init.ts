import { fetchFirst } from '../../../../utils/model/fetch'
import { OrganizationAdmin } from '../../../models'
import { dispatchPasswordResetNotification } from '../../../models/observers/organization-admin-observers'
import randomString from '../../../../utils/string/random-string'
import validateAccountIsActive from '../validation/validate-account-is-active'
import { validateAdminNotFound } from '../validation/validate-admin-not-found'

const setNewPasswordResetToken = async (user, token) => (
  OrganizationAdmin.where({
    id: user.id,
  }).save({
    password_reset_token: token,
    password_reset_token_created_at: new Date(),
  }, { patch: true })
)

export default async payload => {
  const { email } = payload
  const user = await fetchFirst(OrganizationAdmin)({ email })

  validateAdminNotFound(user)
  validateAccountIsActive(user as any)

  const token = randomString()

  await setNewPasswordResetToken(user, token)

  try {
    await dispatchPasswordResetNotification(user, token)
  } catch (e) {
    console.log(e)
  }

  return user
}
