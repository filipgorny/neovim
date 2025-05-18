import { findOneOrFail } from '../../students/student-repository'
import issueAuthToken from '../../../../services/students/issue-student-auth-token'
import { notFoundException, throwException } from '../../../../utils/error/error-factory'
import { PREVIEW_STUDENT_EMAIL } from '../../../constants'

const buildImpersonationData = admin => ({
  impersonated_by: {
    id: admin.id,
    email: admin.email,
    role: admin.admin_role,
  },
  is_impersonated: true,
})

const buildResponse = (admin, student) => ({
  id: student.id,
  name: student.name,
  email: student.email,
  external_id: student.external_id,
  token: issueAuthToken(student, buildImpersonationData(admin)),
})

export default async (instance: any, id: string) => {
  const student = await findOneOrFail({ id })

  if (PREVIEW_STUDENT_EMAIL === student.email) {
    throwException(notFoundException('Student'))
  }

  return buildResponse(instance.toJSON(), student)
}
