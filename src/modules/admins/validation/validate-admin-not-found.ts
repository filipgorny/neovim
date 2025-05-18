import R from 'ramda'
import { throwException, notFoundException } from '../../../../utils/error/error-factory'

const throwNotFoundException = () => throwException(notFoundException('Admin'))

export const validateAdminNotFound = (entity: object | undefined) => (
  R.when(
    R.isNil,
    throwNotFoundException
  )(entity)
)
