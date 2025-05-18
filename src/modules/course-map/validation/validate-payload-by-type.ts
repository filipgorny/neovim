import moment from 'moment'
import * as R from 'ramda'
import { int } from '../../../../utils/number/int'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { CourseMapTypes } from '../course-map-types'

const validateFreeTrialHasDaysAmount = R.pipe(
  R.pathOr(0, ['metadata', 'days_amount']),
  int,
  R.when(
    R.gte(0),
    () => throwException(customException('course_map.days_amount.invalid', 422, '"days_amount" property must be greater than 0'))
  )
)

const validateLiveCourseHasExpiresAt = R.pipe(
  R.pathOr(null, ['metadata', 'expires_at']),
  moment,
  R.invoker(0, 'isValid'),
  R.unless(
    R.equals(true),
    () => throwException(customException('course_map.expires_at.invalid', 422, '"expires_at" property must be a valid date'))
  )
)

export const validatePayloadByType = R.cond([
  [R.propEq('type', CourseMapTypes.freeTrial), validateFreeTrialHasDaysAmount],
  [R.propEq('type', CourseMapTypes.liveCourse), validateLiveCourseHasExpiresAt],
  [R.T, R.identity],
])
