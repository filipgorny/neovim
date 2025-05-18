import * as R from 'ramda'
import { examExpiredException, throwException } from '../../../../utils/error/error-factory'
import { isExpired } from '../student-exam-service'

export const validateExpiredExam = R.when(
  // @ts-ignore
  isExpired,
  () => throwException(examExpiredException())
)
