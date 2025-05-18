import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { findOneOrFail as findContent } from '../../book-contents/book-content-repository'
import { fileSchema, schema } from '../validation/schema/upload-attachment-schema'
import { validateFileMimeType } from '../validation/validate-file-mime-type'
import uploadFile from '../../../../services/s3/upload-file'
import { fixAttachmentOrderAfterAdding } from '../book-content-attachment-repository'
import { BookContentAttachmentTypeEnum } from '../book-content-attachment-types'
import { createBookContentAttachment } from '../book-content-attachment-service'
import { captionsFromPayload } from './helpers/captions-from-payload'
import { S3_PREFIX_BOOK_CONTENT_ATTACHMENT } from '../../../../services/s3/s3-file-prefixes'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'

const prepareAndSaveNewAttachment = async (content, details, order, captions) => {
  await fixAttachmentOrderAfterAdding(content.id, order)

  const created = await createBookContentAttachment(BookContentAttachmentTypeEnum.file, order, details, content.id, captions)

  return {
    ...created.toJSON(),
    url: generatePresignedUrl(created.get('raw')),
    delta_object: null,
    ...created.get('delta_object'),
  }
}

export default async (files, payload) => {
  validateEntityPayload(schema)(payload)
  validateFilesPayload(fileSchema)(files)

  const { image } = files
  const { contentId, order } = payload

  validateFileMimeType(image.mimetype)

  const content = await findContent({ id: contentId })
  const imageKey = await uploadFile(image.data, image.mimetype, S3_PREFIX_BOOK_CONTENT_ATTACHMENT)

  return prepareAndSaveNewAttachment(content, imageKey, order, captionsFromPayload(payload))
}
