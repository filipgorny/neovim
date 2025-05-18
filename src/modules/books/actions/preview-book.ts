import jwt from 'jsonwebtoken'
import env from '../../../../utils/env'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { PREVIEW_STUDENT_EMAIL } from '../../../constants'
import { findOneOrFail } from '../book-repository'

const TOKEN_EXPIRES_IN_ONE_HOUR = '60m'

const tokenConfig = {
  expiresIn: TOKEN_EXPIRES_IN_ONE_HOUR,
}

const buildPayload = (externalId, admin) => ({
  student_email: PREVIEW_STUDENT_EMAIL,
  student_phone: ' ',
  student_name: 'Preview Student',
  product_ids: externalId,
  product_type: 'T',
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

export default async (instance, id) => {
  const book = await findOneOrFail({ id })

  if (!book.external_id) {
    throwException(customException('book.missing-product-id', 422, 'Book has to include external_id'))
  }

  return {
    token: issueToken(
      buildPayload(book.external_id, instance)
    ),
  }
}
