import jwt from 'jsonwebtoken'
import env from '../../../../utils/env'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { PREVIEW_STUDENT_EMAIL } from '../../../constants'
import { findOneOrFail } from '../exam-repository'
import { AdminRoleEnum } from '../../admins/admin-roles'

const TOKEN_EXPIRES_IN_ONE_HOUR = '60m'

const tokenConfig = {
  expiresIn: TOKEN_EXPIRES_IN_ONE_HOUR,
}

const buildPayload = (externalId, admin) => ({
  student_email: PREVIEW_STUDENT_EMAIL,
  student_phone: ' ',
  student_name: 'Preview Student',
  product_ids: externalId,
  product_type: 'E',
  date_created: new Date(),
  preview_admin: {
    id: admin.get('id'),
    email: admin.get('email'),
    role: admin.get('admin_role'),
  },
})

const issueToken = payload => (
  jwt.sign(payload, env('EXTERNAL_APP_SECRET'), tokenConfig)
)

export default async (instance, id, request) => {
  const exam = await findOneOrFail({ id })

  const adminCourseIds = request.adminCourseIds || []

  if (instance.get('admin_role') !== AdminRoleEnum.master_admin && !adminCourseIds.length && instance.get('can_manage_exams') === false) {
    throwException(customException('admins.permission-exception', 403, 'Admin must have exam management permission.'))
  }

  if (!exam.external_id) {
    throwException(customException('exam.missing-product-id', 422, 'Exam has to include external_id'))
  }

  return {
    token: issueToken(
      buildPayload(exam.external_id, instance)
    ),
  }
}
