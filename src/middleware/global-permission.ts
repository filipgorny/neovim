import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import { tokenFromRequest, parseToken } from '../../utils/request/data-from-request'
import validateAccountIsActive from '../modules/admins/validation/validate-account-is-active'
import { Admin } from '../models'
import { AdminRoleEnum, AdminRoles } from '../modules/admins/admin-roles'
import { customException } from '@desmart/js-utils'
import {
  throwException,
  unauthenticatedException
} from '../../utils/error/error-factory'

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

const permCheckRaw = (...perms: string[]) => async (req, res, next) => {
  const token = tokenFromRequest(req)
  const data = token ? parseToken(token) : null

  if (!data) throwUnauthenticatedException()

  const adminEntity = await adminCheck(data)

  if (!adminEntity) {
    throwUnauthenticatedException()
  }

  const admin = adminEntity.user.toJSON()

  if (admin.admin_role === AdminRoleEnum.master_admin) {
    req.user = adminEntity.user
    return next()
  }

  let anyPermTrue = false

  R.forEach(
    perm => {
      if (admin[perm] && admin[perm] === true) {
        anyPermTrue = true
      }
    }
  )(perms)

  if (!anyPermTrue) {
    throwException(customException('admins.permission-exception', 403, `Admin missing permissions. Valid permissions: ${perms.join(', ')}`))
  }

  req.user = adminEntity.user

  next()
}

export const permCheck = (...perms: string[]) => wrap(permCheckRaw(...perms))

export const permCheckSoft = (...perms: string[]) => wrap(async (req, res, next) => {
  await permCheckRaw(...perms)(req, res, next).catch((e) => {
    req._authError = true

    return next()
  })
})
