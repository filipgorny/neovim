import * as R from 'ramda'
import { customException, throwException } from '../../../../utils/error/error-factory'
import { findOneWithoutDeleted } from '../course-repository'

type Payload = {
  title: string,
  external_id: string,
  codename: string,
}

const throwExternalIdAlreadyExistsException = () => throwException(customException('courses.codename.already-exists', 403, 'Codename already exists'))

export const checkIfCodenameAlreadyExists = async (payload: Payload) => {
  if (!payload.codename) {
    return payload
  }

  return R.pipeWith(R.andThen)([
    async () => findOneWithoutDeleted({ codename: payload.codename }),
    R.ifElse(
      R.isNil,
      R.always(payload),
      throwExternalIdAlreadyExistsException
    ),
  ])(true)
}
