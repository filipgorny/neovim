import R from 'ramda'
import { throwException, customException } from '../../../../utils/error/error-factory'
import { DELETED_AT } from '../../../../utils/generics/repository'

const throwAccountInactiveException = (): never => throwException(customException('user.inactive', 403))

export default R.pipe(
  R.both(
    R.prop('is_active'),
    R.pipe(R.prop(DELETED_AT), R.isNil)
  ),
  R.when(
    R.equals(false),
    throwAccountInactiveException
  )
) as (user: { is_active: boolean, deleted_at?: Date }) => void
