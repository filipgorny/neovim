import R from 'ramda'
import { throwException, customException } from '../../../../utils/error/error-factory'
import { PASSWORD_MIN_LENGTH } from '../../../constants'

const throwNewPasswordInvalidException = () => throwException(customException('user.password-reset.new-password-invalid', 403))
const containsSpecialCharacter = R.match(/[^a-zA-Z0-9]/g)

const hasProperLength = R.pipe(
  R.prop('length'),
  R.ifElse(
    R.lte(PASSWORD_MIN_LENGTH),
    R.always(true),
    R.always([])
  )
)

export default R.pipe(
  R.juxt([
    containsSpecialCharacter,
    hasProperLength,
  ]),
  R.when(
    R.any(R.isEmpty),
    throwNewPasswordInvalidException
  )
)
