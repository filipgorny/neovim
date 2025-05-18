import { throwException, unauthenticatedException } from '@desmart/js-utils'
import { parseToken, tokenFromRequest } from '../../utils/request/data-from-request'
import { AdminRoles } from '../modules/admins/admin-roles'
import { Admin } from '../models'
import validateAccountIsActive from '../modules/admins/validation/validate-account-is-active'

const throwUnauthenticatedException = (): never => throwException(unauthenticatedException())

const authorizeUser = async (MODEL, id) => {
  const user = await (
    new MODEL({ id }).fetch()
  ).catch(throwUnauthenticatedException)

  validateAccountIsActive(user.toJSON())

  return user
}

const adminCheck = async (data, subroles: string[] = [...AdminRoles]) => {
  const user = await authorizeUser(Admin, data.id)

  if (!subroles.includes(user.get('admin_role'))) {
    throwUnauthenticatedException()
  }

  return { user }
}

export const adminFromRequest = async (req) => {
  const token = tokenFromRequest(req)
  const data = token ? parseToken(token) : null

  if (!data) throwUnauthenticatedException()

  const adminEntity = await adminCheck(data)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  req.user = adminEntity.user

  return adminEntity.user.toJSON()
}
