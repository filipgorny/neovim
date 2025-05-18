import * as R from 'ramda'
import { wrap } from 'express-promise-wrap'
import { findOneOrFail } from '../modules/student-courses/student-course-repository'
import { pathOrFail } from '../../utils/object/path-or-fail'
import { PREVIEW_STUDENT_EMAIL } from '../constants'
import {
  customException,
  studentAuthRequiredException,
  studentCourseContextRequiredException,
  studentCourseNotFoundException,
  studentCoursePausedException,
  throwException
} from '../../utils/error/error-factory'

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

export const studentCourseContextOptional = wrap(async (req, res, next) => {
  const student = pathOrFail(['user'], studentAuthRequiredException())(req)

  if (req.user.get('email') === PREVIEW_STUDENT_EMAIL) {
    return next()
  }

  const studentCourseId = R.path(['headers', 'x-student-course-id'])(req)

  const studentCourse = studentCourseId
    ? await findOneOrFail({
      id: studentCourseId,
      student_id: student.id,
    })
    : undefined

  req.studentCourse = studentCourse

  next()
})
