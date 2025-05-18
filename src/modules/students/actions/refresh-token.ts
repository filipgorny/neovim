import issueAuthToken from '../../../../services/students/issue-student-auth-token'
import { findOne as findStudentToken, patch as updateStudentToken } from '../../student-tokens/student-tokens-repository'
import sha1 from '../../../../utils/hashing/sha1'
import { throwException, unauthorizedException } from '../../../../utils/error/error-factory'
import { parseToken } from '../../../../utils/request/data-from-request'
import { updateCodeExpiresAt } from '../student-repository'

const buildResponse = (student, additionalPayload) => (
  {
    id: student.id,
    name: student.name,
    email: student.email,
    external_id: student.external_id,
    token: issueAuthToken(student, additionalPayload),
  }
)

export default async (student, impersonateData, previewData) => {
  const result = await buildResponse(
    student.toJSON(),
    {
      ...impersonateData,
      ...previewData,
    }
  )

  const studentToken = await findStudentToken({ student_id: student.id })
  const hashedToken = sha1(result.token)
  const data = parseToken(result.token)
  if (studentToken) {
    await updateStudentToken(studentToken.id, { token: hashedToken, created_at: new Date() })
    await updateCodeExpiresAt(student.id)
  } else if (!data.is_impersonated) {
    throwException(unauthorizedException())
  }

  return result
}
