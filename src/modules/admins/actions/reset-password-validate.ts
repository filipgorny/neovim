import { fetchFirst } from '../../../../utils/model/fetch'
import { Admin } from '../../../models'
import { validateTokenExpiration, validateToken } from '../validation/reset-password-validators'

export default async payload => {
  const { id, token } = payload
  const user = await fetchFirst(Admin)({ id })

  validateToken(token)(user)
  validateTokenExpiration(user)

  return {
    isValid: true,
  }
}
