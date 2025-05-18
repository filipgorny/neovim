import * as R from 'ramda'
import * as plivo from 'plivo'
import env from '../../../../utils/env'
import { clearVerificationCode, setVerificationCode } from '../../students/student-repository'
import { schema as syncStudentSchema } from '../../students/validation/schema/sync-student-schema'
import { getPayloadFromRequestToken, validateAccountIsActive } from '../../students/actions/sync-student'
import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import { Settings } from '../../settings/settings'
import { getSetting } from '../../settings/settings-service'
import { syncStudent } from '../../students/student-service'
import { dispatchVerificationCodeAsStudent, student2FactorAuthenticationIsEnabled } from '../student-two-factor-authentication-service'
import { customException, throwException, twoFactorAuthenticationDisabledException } from '../../../../utils/error/error-factory'
import * as notificationDispatcher from '../../../../services/notification/notification-dispatcher'

const getVerificationCode = () => {
  const cyfres = R.map(n => `${n}`)(R.range(0, 10))

  let code = ''
  for (let i = 0; i < 6; i++) {
    code += cyfres[Math.floor(Math.random() * cyfres.length)]
  }

  return code
}

export default async (request, query) => {
  const twoFAEnabled = await student2FactorAuthenticationIsEnabled()
  if (!twoFAEnabled) {
    throwException(twoFactorAuthenticationDisabledException())
  }

  const headerTokenPayload = await getPayloadFromRequestToken(request)

  validateEntityPayload(syncStudentSchema)(headerTokenPayload)

  const student_email = headerTokenPayload.student_email.toLowerCase()

  const { student_name, student_phone } = headerTokenPayload

  await validateAccountIsActive(student_email)

  const student = await syncStudent(
    student_email,
    student_name,
    student_phone,
    await getSetting(Settings.SaltyBucksStartingBalance)
  )

  return dispatchVerificationCodeAsStudent({ student_phone, student_email, student_name }, student, R.propOr(false, 'as_email', query))
}
