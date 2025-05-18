import R from 'ramda'
import { cannotDeleteSelfException, throwException } from '../../../../utils/error/error-factory'

const throwWhenIdsAreEqual = () => throwException(cannotDeleteSelfException())

export default id => R.pipe(
  R.prop('id'),
  R.when(
    R.equals(id),
    throwWhenIdsAreEqual
  )
)
