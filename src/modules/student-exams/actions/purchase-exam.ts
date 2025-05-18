import * as R from 'ramda'
import jwt from 'jsonwebtoken'
import { logAuthError } from '../../auth-debug/auth-debug-service'
import env from '../../../../utils/env'
import { findStudentByExternalId, getStudentByLikiRequest } from '../../students/student-service'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/purchase-exam-token-payload-schema'
import { purchaseExam } from '../student-exam-service'
import logger from '../../../../services/logger/logger'

export type Payload = {
  external_id: string,
  external_created_at: string
}

const logAuthFailure = (authToken: string) => async (e: any) => {
  console.log('FAILED')

  await logAuthError(authToken)

  throw e
}

export const getPayloadFromLikiRequestToken = async (request) => {
  const token = R.path(['headers', 'x-proxy-authorization'])(request)

  try {
    return jwt.verify(token, env('LIKI_AUTH_KEY'))
  } catch (error) {
    await logAuthFailure(token)(error)
  }
}

export default async (request, payload: Payload) => {
  const student = await getStudentByLikiRequest(request)

  logger.info('purchase-exam for student', { student })

  await purchaseExam(student, payload)

  logger.info('/student-exams/purchase finish')
}
