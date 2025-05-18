import R from 'ramda'
import { throwException, customException } from '../../../../utils/error/error-factory'
import olderThanNMinutes from '../../../../utils/datetime/older-than-n-minutes'
import { MINUTES_TOKEN_IS_VALID } from '../../../constants'

const throwPasswordResetTokenMismatchException = () => throwException(customException('user.password-reset-token.mismatch', 403))
const throwPasswordResetTokenExpiredException = () => throwException(customException('user.password-reset-token.expired', 403))

export const validateToken = tokenFromRequest => R.pipe(
  R.prop('password_reset_token'),
  R.unless(
    R.equals(tokenFromRequest),
    throwPasswordResetTokenMismatchException
  )
)

export const validateTokenExpiration = R.pipe(
  R.prop('password_reset_token_created_at'),
  olderThanNMinutes(MINUTES_TOKEN_IS_VALID),
  // @ts-ignore
  R.when(
    R.equals(true),
    throwPasswordResetTokenExpiredException
  )
)
