import { fetchFirst } from '../../../../utils/model/fetch'
import { User } from '../../../models'
import hashString from '../../../../utils/hashing/hash-string'
import { validateTokenExpiration, validateToken } from '../validation/reset-password-validators'
import validatePassword from '../validation/validate-password'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/reset-password-finish-schema'

export default async payload => {
  validateEntityPayload(schema)(payload)

  const {
    id,
    token,
    password,
  } = payload
  const customer = await fetchFirst(User)({ id })

  validateToken(token)(customer)
  // @ts-ignore
  validateTokenExpiration(customer)
  validatePassword(password)

  return User.where({ id })
    .save({
      password: hashString(password),
      password_reset_token: null,
      password_reset_token_created_at: null,
    }, { patch: true })
}
