import * as R from 'ramda'
import * as plivo from 'plivo'
import env from '../../../utils/env'
import { int } from '../../../utils/number/int'
import { findByName as findSettingByName } from '../app-settings/app-settings-repository'
import { clearVerificationCode, setVerificationCode } from '../students/student-repository'
import { ENABLE_2FA_SETTING } from './actions/enable'
import * as notificationDispatcher from '../../../services/notification/notification-dispatcher'
import logger from '../../../services/logger/logger'

export const student2FactorAuthenticationIsEnabled = async () => (
  R.pipeWith(R.andThen)([
    async () => findSettingByName(ENABLE_2FA_SETTING),
    R.prop('value'),
    int,
    R.equals(1),
  ])(true)
)

const getVerificationCode = () => {
  const cyfres = R.map(n => `${n}`)(R.range(0, 10))

  let code = ''
  for (let i = 0; i < 6; i++) {
    code += cyfres[Math.floor(Math.random() * cyfres.length)]
  }

  return code
}

export const dispatchVerificationCodeAsStudent = async ({ student_phone, student_email, student_name }, student, as_email = false) => {
  const code = getVerificationCode()

  const payload = {
    from: env('PLIVO_PHONE_NUMBER'),
    to: student_phone,
    code,
    name: student_name,
  }

  await clearVerificationCode(student.id)

  if (as_email) {
    try {
      logger.info('2FA: sending code via email to', student_email)

      await notificationDispatcher.sent2faCode({
        email: student_email,
        code,
      })
    } catch (error) {
      console.log('Error sending 2FA code', error)
    }
  } else {
    logger.info('2FA: sending code via SMS to', payload.to)

    const phloClient = new plivo.PhloClient(env('PLIVO_AUTH_ID'), env('PLIVO_AUTH_TOKEN'), {})
    const result = await phloClient.phlo(env('PLIVO_PHLO_ID')).run(payload)

    console.log('Phlo run result', result)
  }

  await setVerificationCode(student.id, code)
}

export const dispatchVerificationCodeAsAdmin = async (student) => {
  const code = getVerificationCode()

  const payload = {
    from: env('PLIVO_PHONE_NUMBER'),
    to: student.phone_number,
    code,
    name: student.name,
  }

  await clearVerificationCode(student.id)

  await notificationDispatcher.sent2faCode({
    email: student.email,
    code,
  })

  const phloClient = new plivo.PhloClient(env('PLIVO_AUTH_ID'), env('PLIVO_AUTH_TOKEN'), {})
  const result = await phloClient.phlo(env('PLIVO_PHLO_ID')).run(payload)

  console.log('Phlo run result', result)

  await setVerificationCode(student.id, code)
}
