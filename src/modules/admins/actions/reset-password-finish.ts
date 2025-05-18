import { fetchFirst } from '../../../../utils/model/fetch'
import { Admin } from '../../../models'
import hashString from '../../../../utils/hashing/hash-string'
import { validateTokenExpiration, validateToken } from '../validation/reset-password-validators'
import validatePassword from '../validation/validate-password'

export default async payload => {
  const { id, token, password } = payload
  const customer = await fetchFirst(Admin)({ id })

  validateToken(token)(customer)
  validateTokenExpiration(customer)
  validatePassword(password)

  return Admin.where({ id })
    .save({
      password: hashString(password),
      password_reset_token: null,
      password_reset_token_created_at: null,
    }, { patch: true })
}
