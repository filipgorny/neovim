import { resourceAlreadyExistsException, throwException } from '../../../../utils/error/error-factory'
import { findOne } from '../book-repository'

const throwAlreadyExistsException = (name) => throwException(resourceAlreadyExistsException('Book ' + name))

export const checkIfAlreadyExists = (excludeId?: string) => async payload => {
  const title = payload.title
  const external_id = payload.external_id || payload.externalId
  const entityTitle = title ? await findOne({ title }) : undefined
  const entityExternalId = external_id ? await findOne({ external_id }) : undefined

  if (entityTitle && (excludeId !== entityTitle.id)) {
    throwAlreadyExistsException('title')
  }

  if (entityExternalId && (excludeId !== entityExternalId.id)) {
    throwAlreadyExistsException('external_id')
  }

  return payload
}
