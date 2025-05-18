import R from 'ramda'
import { findOne } from '../admin-repository'
import { throwException, resourceAlreadyExistsException } from '../../../../utils/error/error-factory'

const throwAlreadyExistsException = () => throwException(resourceAlreadyExistsException('Admin'))

export const validateAdminAlreadyExists = async (where: object) => (
  R.pipeWith(R.andThen)([
    findOne,
    R.unless(
      R.isNil,
      throwAlreadyExistsException
    )
  ])(where)
)
