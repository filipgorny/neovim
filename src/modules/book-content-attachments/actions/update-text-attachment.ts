import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/update-text-attachment-schema'
import { updateBookContentAttachment } from '../book-content-attachment-service'
import asAsync from '../../../../utils/function/as-async'
import { findOneOrFail } from '../book-content-attachment-repository'
import { validateAttachmentIsTextType } from '../validation/validate-attachment-type'

const checkIfExists = id => async payload => {
  const attachment = await findOneOrFail({ id })

  validateAttachmentIsTextType(attachment)

  return payload
}

export default async (id: string, payload) => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    checkIfExists(id),
    updateBookContentAttachment(id),
  ])(payload)
)
