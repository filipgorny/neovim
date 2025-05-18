import moment from 'moment'
import { wrap } from 'express-promise-wrap'
import { tokenFromRequest, parseToken } from '../../utils/request/data-from-request'
import validateAccountIsActive from '../modules/admins/validation/validate-account-is-active'
import { extractFirstFulfilledOrThrow, mapPS } from '../../utils/function/mapps'
import { Admin, Student } from '../models'
import { AdminRoleEnum, AdminRoles } from '../modules/admins/admin-roles'
import { UserRole, UserRoleEnum } from './user-roles'
import { StudentRoleEnum, StudentRoles } from '../modules/students/student-roles'
import {
  throwException,
  unauthenticatedException,
  tokenExpiredException,
  unauthorizedException,
  studentNotImpersonatedException,
  accountNotVerifiedTodayException,
  verificationCodeExpiredException
} from '../../utils/error/error-factory'
import { findOne as findStudentToken } from '../modules/student-tokens/student-tokens-repository'
import sha1 from '../../utils/hashing/sha1'
import { DATE_FORMAT_YMD } from '../constants'
import { student2FactorAuthenticationIsEnabled } from '../modules/student-two-factor-authentication/student-two-factor-authentication-service'
import { ErrorRequestHandler, RequestHandler } from 'express'

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

const adminCheck = async (data, subroles: string[] = [...AdminRoles]) => {
  const user = await authorizeUser(Admin, data.id)

  if (!subroles.includes(user.get('admin_role'))) {
    throwUnauthenticatedException()
  }

  return { user }
}

const isImpersonationForbidden = (data, subroles): boolean => (
  data.is_impersonated &&
  subroles.includes(StudentRoleEnum.standard) &&
  subroles.length === 1
)

const isExamPreviewForbidden = (data, subroles): boolean => (
  data.is_preview &&
  subroles.includes(StudentRoleEnum.standard) &&
  subroles.length === 1
)

const isImpersonationRequired = (data, subroles): boolean => (
  !data.is_impersonated &&
  subroles.includes(StudentRoleEnum.impersonator_admin) &&
  subroles.length === 1
)

const studentCheck = async (data, subroles: string[] = [...StudentRoles]) => {
  const user = await authorizeUser(Student, data.id)

  if (isImpersonationForbidden(data, subroles)) throwImpersonationNotAllowedException()
  if (isExamPreviewForbidden(data, subroles)) throwExamPreviewNotAllowedException()
  if (isImpersonationRequired(data, subroles)) throwImpersonationRequiredException()

  const impersonate_data = {
    impersonated_by: data.impersonated_by,
    is_impersonated: data.is_impersonated,
  }

  const preview_data = {
    preview_admin: data.preview_admin,
    is_preview: data.is_preview,
  }

  return { user, impersonate_data, preview_data }
}

const userCheck = (role: UserRole, subroles?: string[]) => async req => {
  const token = tokenFromRequest(req)
  const data = token ? parseToken(token) : null

  if (!data) throwUnauthenticatedException()
  if (!isFromToday(data.createdAt)) throwTokenExpiredException()

  if (role === UserRoleEnum.student) {
    if (!data.is_impersonated && !data.is_preview) {
      const studentToken = await findStudentToken({ student_id: data.id }) // For proper validation and to prevent from logging in on multiple devices, this should be added - token: sha1(token)
      if (!studentToken) throwUnauthenticatedException()
    }
  }

  const result = UserRoleEnum.admin === role
    ? await adminCheck(data, subroles)
    : await studentCheck(data, subroles)

  result.user?.set('role', role)

  return result
}

const auth = (fns: Array<(req: any) => Promise<unknown>>): RequestHandler | ErrorRequestHandler => (
  wrap(async (req, res, next) => {
    const promises = await mapPS(
      async fn => fn(req)
    )(fns)
    const result = extractFirstFulfilledOrThrow(promises)

    req.user = result.user
    req.impersonate_data = result.impersonate_data
    req.preview_data = result.preview_data

    next()
  })
)

/*
  Following constants declare functions to validate specific role of a user
  The naming convention was taken for an easier read while passing those functions to auth
 */
const ADMIN = userCheck(UserRoleEnum.admin)
const MASTER_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.master_admin])
const STUDENT = userCheck(UserRoleEnum.student)
const REAL_STUDENT = userCheck(UserRoleEnum.student, [StudentRoleEnum.standard])
const IMPERSONATOR_ADMIN = userCheck(UserRoleEnum.student, [StudentRoleEnum.impersonator_admin])

/**
 * More detailed admin division introduced in March 2022.
 */
const IGOR = userCheck(UserRoleEnum.admin, [AdminRoleEnum.igor])
const RETAIL_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.retail_admin])
const AUTHOR_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.author_admin])
const FLASHCARD_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.flashcard_admin])
const CONTENT_QUESTION_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.content_question_admin])
const VIDEO_EDITOR = userCheck(UserRoleEnum.admin, [AdminRoleEnum.video_editor])
const TEST_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.test_admin])
const GLOSSARY_ADMIN = userCheck(UserRoleEnum.admin, [AdminRoleEnum.glossary_admin])

export const authAdmin = auth([ADMIN])
export const authMasterAdmin = auth([MASTER_ADMIN])
export const authStudent = auth([STUDENT])
export const authRealStudent = auth([REAL_STUDENT])
export const authImpersonatorAdmin = auth([IMPERSONATOR_ADMIN])
export const authImpersonatorOrAdmin = auth([IMPERSONATOR_ADMIN, ADMIN])
export const authStudentOrAdmin = auth([ADMIN, STUDENT])
export const authStudentOrMasterAdmin = auth([MASTER_ADMIN, STUDENT])

/**
 * Shortcuts, to make routes more readable.
 */
export const Role = {
  igor: IGOR,
  retail: RETAIL_ADMIN,
  author: AUTHOR_ADMIN,
  flashcard: FLASHCARD_ADMIN,
  question: CONTENT_QUESTION_ADMIN,
  video: VIDEO_EDITOR,
  test: TEST_ADMIN,
  glossary: GLOSSARY_ADMIN,
}

/**
 * Opens the route to a list of roles with master admin on top.
 */
export const allow = (...fns) => (
  auth([MASTER_ADMIN, ...fns])
)
