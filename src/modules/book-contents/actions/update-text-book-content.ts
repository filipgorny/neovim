import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/update-text-book-content-schema'
import { updateBookContent } from '../book-content-service'
import asAsync from '../../../../utils/function/as-async'
import { findOneOrFail } from '../book-content-repository'
import { BookContentTypeEnum } from '../book-content-types'
import { notFoundException, throwException } from '../../../../utils/error/error-factory'

const checkIfExists = id => async payload => {
  const content = await findOneOrFail({ id })

  if (content.type === BookContentTypeEnum.file) {
    throwException(notFoundException('BookContent'))
  }

  return payload
}

export default async (id: string, payload) => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    checkIfExists(id),
    updateBookContent(id),
  ])(payload)
)
