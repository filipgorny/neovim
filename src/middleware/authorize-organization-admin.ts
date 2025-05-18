import moment from 'moment'
import { wrap } from 'express-promise-wrap'
import { tokenFromRequest, parseToken } from '../../utils/request/data-from-request'
import validateAccountIsActive from '../modules/admins/validation/validate-account-is-active'
import { extractFirstFulfilledOrThrow, mapPS } from '../../utils/function/mapps'
import { OrganizationAdmin, Admin } from '../models'
import { OrganizationAdminRole, OrganizationAdminRoleEnum, OrganizationAdminRoles } from '../modules/admins/organization-admin-roles'
// import { OrganizationAdminRole, OrganizationAdminRoleEnum } from './organization-admin-roles'
import { StudentRoleEnum, StudentRoles } from '../modules/students/student-roles'
import {
  throwException,
  unauthenticatedException,
  tokenExpiredException,
  unauthorizedException,
  studentNotImpersonatedException
} from '../../utils/error/error-factory'
import { findOne as findStudentToken } from '../modules/student-tokens/student-tokens-repository'
import sha1 from '../../utils/hashing/sha1'
import { ErrorRequestHandler, RequestHandler } from 'express'
import { UserRole, UserRoleEnum } from './user-roles'
import { AdminRoleEnum, AdminRoles } from '../modules/admins/admin-roles'

const throwTokenExpiredException = (): never => throwException(tokenExpiredException())
const throwUnauthenticatedException = (): never => throwException(unauthenticatedException())
const throwImpersonationNotAllowedException = (): never => throwException(unauthorizedException())
const throwExamPreviewNotAllowedException = (): never => throwException(unauthorizedException())
const throwImpersonationRequiredException = (): never => throwException(studentNotImpersonatedException('Action not allowed for student'))

const isFromToday = (date): boolean => moment(date).diff(moment(), 'days') === 0

const authorizeUser = async (MODEL, id) => {
  const user = await (
    new MODEL({ id }).fetch()
  ).catch(throwUnauthenticatedException)

  validateAccountIsActive(user.toJSON())

  return user
}

const adminCheck = async (Model, data, subroles: string[] = [...OrganizationAdminRoles]) => {
  const user = await authorizeUser(Model, data.id)

  if (!subroles.includes(user.get('admin_role'))) {
    throwUnauthenticatedException()
  }

  return { user }
}

// const isImpersonationForbidden = (data, subroles): boolean => (
//   data.is_impersonated &&
//   subroles.includes(StudentRoleEnum.standard) &&
//   subroles.length === 1
// )

// const isExamPreviewForbidden = (data, subroles): boolean => (
//   data.is_preview &&
//   subroles.includes(StudentRoleEnum.standard) &&
//   subroles.length === 1
// )

// const isImpersonationRequired = (data, subroles): boolean => (
//   !data.is_impersonated &&
//   subroles.includes(StudentRoleEnum.impersonator_admin) &&
//   subroles.length === 1
// )

// const studentCheck = async (data, subroles: string[] = [...StudentRoles]) => {
//   const user = await authorizeUser(Student, data.id)

//   if (isImpersonationForbidden(data, subroles)) throwImpersonationNotAllowedException()
//   if (isExamPreviewForbidden(data, subroles)) throwExamPreviewNotAllowedException()
//   if (isImpersonationRequired(data, subroles)) throwImpersonationRequiredException()

//   const impersonate_data = {
//     impersonated_by: data.impersonated_by,
//     is_impersonated: data.is_impersonated,
//   }

//   const preview_data = {
//     preview_admin: data.preview_admin,
//     is_preview: data.is_preview,
//   }

//   return { user, impersonate_data, preview_data }
// }

const userCheck = (Model, role: OrganizationAdminRole, subroles?: string[]) => async req => {
  const token = tokenFromRequest(req)
  const data = token ? parseToken(token) : null

  if (!data) throwUnauthenticatedException()
  if (!isFromToday(data.createdAt)) throwTokenExpiredException()

  const result = await adminCheck(Model, data, subroles)

  result.user?.set('role', role)

  return result
}

const auth = (fns: Array<(req: any) => Promise<unknown>>): RequestHandler | ErrorRequestHandler => (
  wrap(async (req, res, next) => {
    const promises = await mapPS(
      async fn => fn(req)
    )(fns)
    const result = extractFirstFulfilledOrThrow(promises)

    req.user = result.user.toJSON()
    req.impersonate_data = result.impersonate_data
    req.preview_data = result.preview_data

    next()
  })
)

/*
  Following constants declare functions to validate specific role of a user
  The naming convention was taken for an easier read while passing those functions to auth
 */
const ADMIN = userCheck(Admin, UserRoleEnum.admin)
const MASTER_ADMIN = userCheck(Admin, UserRoleEnum.admin, [AdminRoleEnum.master_admin])
const ORG_ADMIN = userCheck(OrganizationAdmin, OrganizationAdminRoleEnum.admin)
const ORG_MASTER_ADMIN = userCheck(OrganizationAdmin, OrganizationAdminRoleEnum.master_admin)

export const authOrganizationAdmin = auth([ORG_ADMIN])
export const authOrganizationMasterAdmin = auth([ORG_MASTER_ADMIN])
export const authOrganizationMasterAdminOrAdmin = auth([ORG_MASTER_ADMIN, ADMIN])
export const authOrganizationAdminOrAdmin = auth([ORG_ADMIN, ADMIN])

/**
 * Opens the route to a list of roles with master admin on top.
 */
export const allow = (...fns) => (
  auth([ORG_MASTER_ADMIN, ...fns])
)
