import { Request } from 'express'
import { getPayloadFromLikiRequestToken } from '../../student-exams/actions/purchase-exam'
import validateEntityPayload from '@desmart/js-utils/dist/validation/validate-entity-payload'
import { schema } from '../validation/schema/purchase-course-token-payload-schema'
import { findStudentByExternalId, getStudentByLikiRequest } from '../../students/student-service'
import { purchaseExtention } from '../student-course-service'
import logger from '../../../../services/logger/logger'
import { StudentCourseTypes } from '../student-course-types'

export type Payload = {
  transaction_id?: string
  external_id: string
  days_amount: number
  type?: StudentCourseTypes
}

export default async (request: Request, payload: Payload) => {
  logger.info('purchaseExtention', { payload })
  const student = await getStudentByLikiRequest(request)

  logger.info('purchaseExtention', { student })
  await purchaseExtention(student, payload)

  logger.info('finish purchaseExtention')
}
