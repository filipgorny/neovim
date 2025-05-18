import moment from 'moment'
import { noVerificationCodeFoundException, studentNotFoundException, throwException, twoFactorAuthenticationDisabledException, verificationCodeExpiredException, wrongVerificationCodeException } from '../../../../utils/error/error-factory'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { getPayloadFromRequestToken, validateAccountIsActive } from '../../students/actions/sync-student'
import { clearVerificationCode, findStudentByPhoneNumberAndEmail, updateCodeExpiresAt } from '../../students/student-repository'
import verifyPhoneNumberAndEmail from './verify-phone-number-and-email'
import { schema as syncStudentSchema } from '../../students/validation/schema/sync-student-schema'
import { student2FactorAuthenticationIsEnabled } from '../student-two-factor-authentication-service'

export default async (request, { code }) => {
  const twoFAEnabled = await student2FactorAuthenticationIsEnabled()
  if (!twoFAEnabled) {
    throwException(twoFactorAuthenticationDisabledException())
  }

  const headerTokenPayload = await getPayloadFromRequestToken(request)

  validateEntityPayload(syncStudentSchema)(headerTokenPayload)

  const student_email = headerTokenPayload.student_email.toLowerCase()
  const { student_phone } = headerTokenPayload

  await validateAccountIsActive(student_email)

  const numberIsVerified = await verifyPhoneNumberAndEmail({ phone_number: student_phone, email: student_email })
  if (!numberIsVerified) throwException(studentNotFoundException())

  const student = await findStudentByPhoneNumberAndEmail(student_phone, student_email)

  if (!student.verification_code) throwException(noVerificationCodeFoundException())

  if (student.verification_code !== code) throwException(wrongVerificationCodeException())

  const now = moment()
  const expirationDatetime = moment(student.code_created_at).add(10, 'minutes')

  if (now.isAfter(expirationDatetime)) throwException(verificationCodeExpiredException())

  await clearVerificationCode(student.id)

  await updateCodeExpiresAt(student.id)
}
