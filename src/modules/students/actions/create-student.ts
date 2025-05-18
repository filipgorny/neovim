import { resourceAlreadyExistsException, throwException } from '@desmart/js-utils'
import { findOne } from '../student-repository'
import { getSetting } from '../../settings/settings-service'
import { Settings } from '../../settings/settings'
import { syncStudent } from '../student-service'
import { studentExternalIdAlreadyExistsException, studentUsernameAlreadyExistsException } from '../../../../utils/error/error-factory'

type Payload = {
  student_email: string
  student_name: string
  student_phone: string
  external_id?: number
  username?: string
}

const validateEmailExists = async (email: string) => {
  const student = await findOne({ email })

  if (student) {
    throwException(resourceAlreadyExistsException('student'))
  }
}

const validateExternalIdExists = async (external_id: number) => {
  const student = await findOne({ external_id })

  if (student) {
    throwException(studentExternalIdAlreadyExistsException())
  }
}

const validateUsernameExists = async (username: string) => {
  const student = await findOne({ username })

  if (student) {
    throwException(studentUsernameAlreadyExistsException())
  }
}

export default async (payload: Payload) => {
  payload.student_email = payload.student_email.toLowerCase()
  const { student_email, student_name, student_phone } = payload

  await validateEmailExists(student_email)

  if (payload.external_id) {
    await validateExternalIdExists(payload.external_id)
  }

  if (payload.username) {
    await validateUsernameExists(payload.username)
  }

  return syncStudent(
    student_email,
    student_name,
    student_phone,
    await getSetting(Settings.SaltyBucksStartingBalance),
    payload.username,
    payload.external_id
  )
}
