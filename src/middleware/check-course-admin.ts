import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import { findOneOrFail } from '../modules/student-courses/student-course-repository'
import { pathOrFail } from '../../utils/object/path-or-fail'
import { PREVIEW_STUDENT_EMAIL } from '../constants'
import {
  adminAuthRequiredException,
  customException,
  studentAuthRequiredException,
  studentCourseContextRequiredException,
  studentCourseNotFoundException,
  studentCoursePausedException,
  throwException
} from '../../utils/error/error-factory'
import { findOneOrFail as findAdmin } from '../modules/admins/admin-repository'
import { AdminRoleEnum } from '../modules/admins/admin-roles'

export const studentCourseContext = wrap(async (req, res, next) => {
  const student = pathOrFail(['user'], studentAuthRequiredException())(req)

  if (req.user.get('email') === PREVIEW_STUDENT_EMAIL) {
    return next()
  }

  const studentCourseId = pathOrFail(['headers', 'x-student-course-id'], studentCourseContextRequiredException())(req)
  let studentCourse

  try {
    studentCourse = await findOneOrFail({
      id: studentCourseId,
      student_id: student.id,
    })
  } catch (error) {
    throwException(studentCourseNotFoundException())
  }

  if (studentCourse.is_paused) {
    throwException(studentCoursePausedException())
  }

  req.studentCourse = studentCourse

  next()
})

const checkCourseAdmin = (course_id: string, permissions = []) => async (req, res, next) => {
  const admin = pathOrFail(['user'], adminAuthRequiredException())(req)
  const profile = await findAdmin({ id: admin.id }, ['adminCourses.course'])

  if (profile.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const hasRequiredPermission = permissions.length === 0 || permissions.some(permission => profile[permission] === true)

  if (hasRequiredPermission) {
    return next()
  }

  const courseIds = R.pipe(
    R.pathOr([], ['adminCourses']),
    R.pluck('course'),
    R.pluck('id')
  )(profile)

  if (!courseIds.includes(course_id)) {
    req._authError = true
  } else {
    return next()
  }

  if (req._authError) {
    throwException(customException('admins.course-admin.permission-exception', 403, 'Admin must have chosen course assigned.'))
  }

  next()
}

export const getCourseIdsAccessibleToAdmin = async (req, res, next) => {
  const admin = pathOrFail(['user'], adminAuthRequiredException())(req)
  const profile = await findAdmin({ id: admin.id }, ['adminCourses.course'])

  if (profile.admin_role === AdminRoleEnum.master_admin) {
    return next()
  }

  const courseIds = R.pipe(
    R.pathOr([], ['adminCourses']),
    R.pluck('course'),
    R.pluck('id')
  )(profile)

  req.adminCourseIds = courseIds

  return next()
}

const checkCourseAdminByPath = (path = ['params', 'id'], permissions = []) => async (req, res, next) => {
  const courseId = R.path(path)(req)

  const admin = req.user.toJSON()

  const hasRequiredPermission = permissions.length === 0 || permissions.some(permission => admin[permission] === true)

  if (hasRequiredPermission) {
    return next()
  }

  return checkCourseAdmin(courseId)(req, res, next)
}

export const checkCourseAdminByPayload = (path = ['course_id'], permissions = []) => wrap(async (req, res, next) => {
  return checkCourseAdminByPath(['body', ...path], permissions)(req, res, next)
})

export const checkCourseAdminByUrlParam = (path = ['course_id'], permissions = []) => wrap(async (req, res, next) => {
  return checkCourseAdminByPath(['params', ...path], permissions)(req, res, next)
})

export const checkCourseAdminComplex = (findEntityFn: any, pathToEntityId = ['params', 'id'], pathToCourseId = ['course_id'], withRelated = [], permissions = []) => wrap(async (req, res, next) => {
  // Fetch the related entity
  const entity = await findEntityFn({ id: R.path(pathToEntityId)(req) }, withRelated)

  // Extract the course ID from the entity
  const courseId = R.path(pathToCourseId)(entity)

  return checkCourseAdmin(courseId, permissions)(req, res, next)
})
