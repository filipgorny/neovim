import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneWithoutDeleted } from '../course-repository'

type Payload = {
  title: string,
  external_id: string,
}

const throwExternalIdAlreadyExistsException = () => throwException(customException('courses.external-id.already-exists', 403, 'External ID already exists'))

export const checkIfExternalIdAlreadyExists = async (payload: Payload) => (
  R.pipeWith(R.andThen)([
    async () => findOneWithoutDeleted({ external_id: payload.external_id }),
    R.ifElse(
      R.isNil,
      R.always(payload),
      throwExternalIdAlreadyExistsException
    ),
  ])(true)
)
