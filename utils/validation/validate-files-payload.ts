import R from 'ramda'
import { throwException, customException } from '../error/error-factory'
import validateEntityPayload from './validate-entity-payload'

const throwNoFilesException = (keys: string[]) => throwException(customException('entity.invalid', 422, `No files attached, expecting at least one of the following: ${keys.join(', ')}`))

const getSchemaKeys = schema => {
  const keys = []
  for (const i of schema._ids._byKey.entries()) {
    keys.push(i[0])
  }

  return keys
}

const validateFilesPayload = schema => payload => {
  const keys = getSchemaKeys(schema)

  if (R.isNil(payload)) throwNoFilesException(keys)

  validateEntityPayload(schema)(payload)
}

export default validateFilesPayload
