import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/create-attachment-schema'
import asAsync from '../../../../utils/function/as-async'
import { findOneOrFail as findContent } from '../../book-contents/book-content-repository'
import { createBookContentAttachment } from '../book-content-attachment-service'
import { fixAttachmentOrderAfterAdding } from '../book-content-attachment-repository'

const prepareAndSaveNewAttachment = async payload => {
  const { type, contentId, raw, order, delta_object } = payload
  const content = await findContent({ id: contentId })

  await fixAttachmentOrderAfterAdding(contentId, order)

  return createBookContentAttachment(type, order, raw, content.id, delta_object)
}

export default async payload => (
  R.pipeWith(R.andThen)([
    asAsync(validateEntityPayload(schema)),
    prepareAndSaveNewAttachment,
  ])(payload)
)
