import env from '../../../../../utils/env'
import syncStudent from '../sync-student'
import jwt from 'jsonwebtoken'

const TOKEN_EXPIRES_IN = '3m'

export const issueAuthToken = (additional) => jwt.sign({
  ...additional,
}, env('EXTERNAL_APP_SECRET'), { expiresIn: TOKEN_EXPIRES_IN })

export const simulateSyncStudent = async (email, name, phone_number) => {
  const tokenPayload = {
    student_name: name,
    student_email: email,
    student_phone: phone_number,
  }
  const token = issueAuthToken(tokenPayload)

  const request = {
    headers: {
      'x-proxy-authorization': token,
    },
  }

  return syncStudent(request)
}
