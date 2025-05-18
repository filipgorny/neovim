import * as R from 'ramda'
import { resourceAlreadyExistsException, throwException } from '../../../../utils/error/error-factory'
import { findOne } from '../course-repository'

type Payload = {
  title: string,
  external_id?: string,
}

const throwAlreadyExistsException = () => throwException(resourceAlreadyExistsException('Course'))

export const checkIfAlreadyExists = (excludeId?: string) => async (payload: Payload) => {
  const entity = await findOne({ title: payload.title })

  if (entity && excludeId && excludeId === entity.id) {
    return payload
  }

  return R.ifElse(
    R.isNil,
    R.always(payload),
    throwAlreadyExistsException
  )(entity)
}
