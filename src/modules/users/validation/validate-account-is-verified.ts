import R from 'ramda'
import { throwException, customException } from '../../../../utils/error/error-factory'

const throwAccountNotVerifiedException = () => throwException(customException('user.not-verified', 403))

const validateAccountIsActive = R.pipe(
  R.prop('is_email_verified'),
  R.when(
    R.equals(false),
    throwAccountNotVerifiedException
  )
)

export default validateAccountIsActive
