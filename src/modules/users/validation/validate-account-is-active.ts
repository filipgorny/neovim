import R from 'ramda'
import { throwException, customException } from '../../../../utils/error/error-factory'

const throwAccountInactiveException = () => throwException(customException('user.inactive', 403))

export default R.pipe(
  R.prop('is_active'),
  R.when(
    R.equals(false),
    throwAccountInactiveException
  )
)
