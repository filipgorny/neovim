import R from 'ramda'
import { throwException, unauthenticatedException } from '../../../../utils/error/error-factory'
import compareHashes from '../../../../utils/hashing/compare-hashes'

const throwUnauthenticatedException = () => throwException(unauthenticatedException())

const validatePasswordIsCorrect = (customer, password) => (
  R.pipe(
    R.prop('password'),
    compareHashes(password),
    // @ts-ignore
    R.when(
      R.equals(false),
      throwUnauthenticatedException
    )
    // @ts-ignore
  )(customer)
)

export default validatePasswordIsCorrect
