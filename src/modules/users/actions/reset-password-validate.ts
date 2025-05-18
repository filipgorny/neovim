import { fetchFirst } from '../../../../utils/model/fetch'
import { User } from '../../../models'
import { validateTokenExpiration, validateToken } from '../validation/reset-password-validators'

export default async payload => {
  const {
    id,
    token,
  } = payload
  const user = await fetchFirst(User)({ id })

  validateToken(token)(user)
  // @ts-ignore
  validateTokenExpiration(user)

  return {
    isValid: true,
  }
}
