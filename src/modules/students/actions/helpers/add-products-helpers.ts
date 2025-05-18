// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken')
import * as R from 'ramda'
import env from '../../../../../utils/env'
import { ProductTypeEnum } from '../../product-types'
import { findOneOrFail as findStudent } from '../../../students/student-repository'
import moment from 'moment'
import { DATETIME_COURSE_FORMAT, DATETIME_DATABASE_FORMAT, DATE_FORMAT_YMD } from '../../../../constants'
import syncStudent from '../sync-student'

const TOKEN_EXPIRES_IN = '3m'

type Payload = {
  student_ids?: string[]
  course_ids?: string[]
  exam_ids?: string[]
}

const fillExamProductType = (payload: Payload) => (
  R.pipe(
    R.propOr([], 'exam_ids'),
    R.length,
    R.repeat(ProductTypeEnum.exam),
    R.join(',')
  )(payload)
)

const extractIdsAsString = (payload: Payload, type: string) => (
  R.pipe(
    R.propOr([], `${type}_ids`),
    R.join(',')
  )(payload)
)

const repeat = item => R.pipe(
  R.propOr(0, 'length'),
  R.repeat(item),
  R.join(',')
)

const forgeTokenPayload = (student, payload: Payload, now: string) => (
  {
    student_email: student.email,
    student_name: student.name,
    student_phone: student.phone_number,
    product_ids: extractIdsAsString(payload, 'exam'),
    product_type: fillExamProductType(payload),
    date_created: repeat(now)(payload.exam_ids),
    course_ids: extractIdsAsString(payload, 'course'),
    course_transdate: repeat(now)(payload.course_ids),
  }
)

const issueAuthToken = (additional) => (jwt.sign({
  ...additional,
}, env('EXTERNAL_APP_SECRET'), { expiresIn: TOKEN_EXPIRES_IN }))

export const attachProductsToSingleStudent = (payload: Payload) => async (id: string) => {
  const student = await findStudent({ id })
  const tokenPayload = forgeTokenPayload(student, payload, moment().format(DATETIME_COURSE_FORMAT))
  const token = issueAuthToken(tokenPayload)

  const request = {
    headers: {
      'x-proxy-authorization': token,
    },
    is_simulation: true,
  }

  return syncStudent(request)
}
