import { setEmail, setExternalId, setName, setPhoneNumber, setUsername } from '../student-service'
import { findOne } from '../student-repository'
import { resourceAlreadyExistsException, throwException } from '@desmart/js-utils'
import { studentExternalIdAlreadyExistsException, studentUsernameAlreadyExistsException } from '../../../../utils/error/error-factory'

type Payload = {
  external_id: string
  username: string
  name: string
  email: string
  phone_number: string
}

const validateEmailExists = async (student_id: string, email: string) => {
  const student = await findOne({ email })

  if (student && student.id !== student_id) {
    throwException(resourceAlreadyExistsException('student'))
  }
}

const validateExternalIdExists = async (student_id: string, external_id: string) => {
  const student = await findOne({ external_id })

  if (student && student.id !== student_id) {
    throwException(studentExternalIdAlreadyExistsException())
  }
}

const validateUsernameExists = async (student_id: string, username: string) => {
  const student = await findOne({ username })

  if (student && student.id !== student_id) {
    throwException(studentUsernameAlreadyExistsException())
  }
}

export default async (id: string, payload: Payload) => {
  if (payload.external_id) {
    await validateExternalIdExists(id, payload.external_id)
    await setExternalId(id, payload.external_id)
  }

  if (payload.username) {
    await validateUsernameExists(id, payload.username)
    await setUsername(id, payload.username)
  }

  if (payload.name) {
    await setName(id, payload.name)
  }

  if (payload.phone_number) {
    await setPhoneNumber(id, payload.phone_number)
  }

  if (payload.email) {
    await validateEmailExists(id, payload.email)
    await setEmail(id, payload.email)
  }
}
