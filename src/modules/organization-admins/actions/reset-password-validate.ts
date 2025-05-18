import { fetchFirst } from '../../../../utils/model/fetch'
import { OrganizationAdmin } from '../../../models'
import { validateTokenExpiration, validateToken } from '../validation/reset-password-validators'

export default async payload => {
  const { id, token } = payload
  const user = await fetchFirst(OrganizationAdmin)({ id })

  validateToken(token)(user)
  validateTokenExpiration(user)

  return {
    isValid: true,
  }
}
