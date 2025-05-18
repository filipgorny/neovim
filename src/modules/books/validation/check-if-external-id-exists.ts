import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOne } from '../book-repository'

const throwExternalIdAlreadyExistsException = () => throwException(customException('books.external-id.already-exists', 403, 'External ID already exists'))

export const checkIfExternalIdAlreadyExists = (excludeId?: string) => async (payload) => {
  const external_id = payload.external_id || payload.externalId

  return R.pipeWith(R.andThen)([
    async () => findOne({ external_id }),
    R.ifElse(
      R.isNil,
      R.always(payload),
      R.ifElse(
        R.propEq('id', excludeId),
        R.always(payload),
        throwExternalIdAlreadyExistsException
      )
    ),
  ])(true)
}
