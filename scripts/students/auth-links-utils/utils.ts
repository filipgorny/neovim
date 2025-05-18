// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken')
import * as R from 'ramda'
import env from '../../../utils/env'

const TOKEN_EXPIRES_IN_TWO_WEEKS = '20160m' // 60 * 24 * 14

export type PayloadRecord = {
  student_email: string,
  student_name: string,
  student_phone: string,
  product_ids: string,
  date_created: string
}

const tokenConfig = {
  expiresIn: TOKEN_EXPIRES_IN_TWO_WEEKS,
}

const prepareDateCreated = R.pipe(
  R.split(','),
  R.map(R.always(new Date())),
  R.join(',')
)

export const buildPayload = (record: string[]): PayloadRecord => ({
  student_email: record[0],
  student_phone: record[1],
  student_name: `${record[2]} ${record[3]}`,
  product_ids: record[4],
  date_created: prepareDateCreated(record[4]),
})

const issueToken = payload => (
  jwt.sign(payload, env('EXTERNAL_APP_SECRET'), tokenConfig)
)

export const issueAuthUrl = payload => (
  `${env('FRONT_PRODUCTION_URL')}/auth/${issueToken(payload)}`
)
