import R from 'ramda'
import jwt from 'jsonwebtoken'
import env from '../../../../utils/env'
import sha1 from '../../../../utils/hashing/sha1'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/sync-student-schema'
import { bumpLoginCount, patchOwnedProducts, syncStudent } from '../student-service'
import { syncExam } from '../../exams/exam-service'
import mapP from '../../../../utils/function/mapp'
import issueAuthToken from '../../../../services/students/issue-student-auth-token'
import { findOneByEmail } from '../student-repository'
import { accountInactiveException, accountNotVerifiedTodayException, throwException, verificationCodeExpiredException } from '../../../../utils/error/error-factory'
import { ProductTypeEnum } from '../product-types'
import { syncBook } from '../../books/book-service'
import { findOneOrFail } from '../../admins/admin-repository'
import { getSetting } from '../../settings/settings-service'
import { Settings } from '../../settings/settings'
import { syncCourse } from '../../courses/course-service'
import { issueSaltyBucksForCourses } from '../../../../services/salty-bucks/salty-buck-service'
import { findOne as findStudentToken, patch as updateStudentToken, create as createStudentToken } from '../../student-tokens/student-tokens-repository'
import { logAuthError } from '../../auth-debug/auth-debug-service'
import moment from 'moment'
import { student2FactorAuthenticationIsEnabled } from '../../student-two-factor-authentication/student-two-factor-authentication-service'
import logger from '../../../../services/logger/logger'

type Payload = {
  student_name: string,
  student_email: string,
  student_phone: string,
  product_ids: string,
  product_type?: string,
  date_created: string,
  course_transdate?: string,
  course_ids?: string,
  username?: string,
  preview_admin?: {
    id: string,
    email: string,
    role: string,
  },
}

const logAuthFailure = (authToken: string) => async (e: any) => {
  console.log('FAILED')

  await logAuthError(authToken)

  throw e
}

export const getPayloadFromRequestToken = async (request) => {
  const token = R.path(['headers', 'x-proxy-authorization'])(request)

  try {
    return jwt.verify(token, env('EXTERNAL_APP_SECRET'))
  } catch (error) {
    await logAuthFailure(token)(error)
  }
}

const buildResponse = (student, preview_admin = {}) => ({
  id: student.id,
  name: student.name,
  email: student.email,
  token: issueAuthToken(student, preview_admin),
})

export const validateAccountIsActive = async email => {
  const student = await findOneByEmail(email)

  if (!student) {
    return
  }

  R.when(
    R.propEq('is_active', false),
    () => throwException(accountInactiveException())
  )(student)
}

const prepareStudentProducts = (productIds, dateCreated, productType) => R.addIndex(R.map)(
  (val, idx) => ({
    id: val,
    created_at: new Date(dateCreated[idx]),
    type: productType[idx],
  })
)(productIds)

const prepareStudentCourses = (courseIds, dateCreated) => R.addIndex(R.map)(
  (val, idx) => ({
    id: val,
    created_at: new Date(dateCreated[idx]),
  })
)(courseIds)

const safeSplit = R.pipe(
  R.when(
    R.isNil,
    R.always('')
  ),
  R.split(',')
)

export default async request => {
  logger.info('syncStudent')

  const payload = await getPayloadFromRequestToken(request)
  const additionalPayload = {}

  logger.debug('syncStudent: payload', payload)

  validateEntityPayload(schema)(payload)

  const student_email = payload.student_email.toLowerCase()

  const { student_name, student_phone, product_ids, date_created, product_type, course_ids, course_transdate, profiling, username } = payload
  const isPlivoOn = !profiling // profiling must be falsy by default so that plivo is on by default

  if (payload.preview_admin) {
    const admin = await findOneOrFail({
      id: R.pathOr('', ['preview_admin', 'id'])(payload),
      email: R.pathOr('', ['preview_admin', 'email'])(payload),
      admin_role: R.pathOr('', ['preview_admin', 'role'])(payload),
    })

    // @ts-ignore
    additionalPayload.is_preview = true
    // @ts-ignore
    additionalPayload.preview_admin = {
      id: admin.id,
      email: admin.email,
      role: admin.admin_role,
    }
  }

  if (!request.is_simulation) {
    await validateAccountIsActive(student_email)
  }

  logger.debug('syncStudent: create account if not exists')

  // Upsert the student's account
  const student = await syncStudent(
    student_email,
    student_name,
    student_phone,
    await getSetting(Settings.SaltyBucksStartingBalance),
    username
  )

  logger.debug('syncStudent: student', student.toJSON())

  const twoFAEnabled = await student2FactorAuthenticationIsEnabled()
  if (twoFAEnabled && isPlivoOn) {
    if (!request.is_simulation && !payload.preview_admin && (!student.toJSON().code_expires_at || moment().isAfter(moment(student.toJSON().code_expires_at)))) {
      throwException(verificationCodeExpiredException())
    }
  }

  const products = R.converge(
    prepareStudentProducts,
    [
      () => safeSplit(product_ids),
      () => safeSplit(date_created),
      () => product_type
        ? R.split(',', product_type)
        : R.repeat(ProductTypeEnum.exam, safeSplit(product_ids).length),
    ]
  )(true)

  const courses = R.converge(
    prepareStudentCourses,
    [
      () => safeSplit(course_ids),
      () => safeSplit(course_transdate),
    ]
  )(true)

  const exams = R.filter(
    R.propEq('type', ProductTypeEnum.exam)
  )(products)

  const books = R.filter(
    R.propEq('type', ProductTypeEnum.book)
  )(products)

  // Sync student's standalone exams
  const syncedExams = await mapP(
    syncExam(student.id, student_email)
  )(exams)

  // Sync student's sandalone books (soon will be deprecated)
  const syncedBooks = await mapP(
    syncBook(student.id, student_email)
  )(books)

  // Sync student's courses
  const syncedCourses = await R.pipeWith(R.andThen)([
    mapP(
      syncCourse(student.id)
    ),
    R.reject(R.not),
  ])(courses)

  if (syncedCourses.length > 0) {
    await issueSaltyBucksForCourses(student.id, syncedCourses)
  }

  await patchOwnedProducts(
    student.id,
    student.get('has_books') || !R.isEmpty(syncedBooks),
    student.get('has_exams') || !R.isEmpty(syncedExams),
    student.get('has_courses') || !R.isEmpty(syncedCourses)
  )

  logger.debug('syncStudent: bump login count')

  await bumpLoginCount(student.toJSON())

  const result = await buildResponse(student.toJSON(), additionalPayload)
  const token = result.token
  const hashedToken = sha1(token)
  const studentToken = await findStudentToken({ student_id: student.id })
  if (studentToken) {
    await updateStudentToken(studentToken.id, { token: hashedToken, created_at: new Date() })
  } else {
    await createStudentToken({ student_id: student.id, token: hashedToken })
  }

  logger.debug('syncStudent: returning result', result)

  return result
}
