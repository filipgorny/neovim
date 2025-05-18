import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema } from '../validation/schema/update-file-attachment-schema'
import { findOneOrFail } from '../book-content-attachment-repository'
import { validateFileMimeType } from '../validation/validate-file-mime-type'
import uploadFile from '../../../../services/s3/upload-file'
import { BookContentAttachmentTypeEnum } from '../book-content-attachment-types'
import { captionsFromPayload } from './helpers/captions-from-payload'
import { updateBookContentAttachment } from '../book-content-attachment-service'
import { S3_PREFIX_BOOK_CONTENT_ATTACHMENT } from '../../../../services/s3/s3-file-prefixes'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'

const prepareFileReupload = async (shouldUpdate, currentKey, files) => {
  if (!shouldUpdate) return currentKey

  validateFileMimeType(files.image.mimetype)

  const uploaded = await uploadFile(files.image.data, files.image.mimetype, S3_PREFIX_BOOK_CONTENT_ATTACHMENT)

  return uploaded
}

export default async (id: string, files, payload) => {
  validateEntityPayload(schema)(payload)

  const attachment = await findOneOrFail({ id, type: BookContentAttachmentTypeEnum.file })
  const shouldReuploadFile = Boolean(files)

  const updatedImageKey = await prepareFileReupload(shouldReuploadFile, attachment.raw, files)
  const updated = await updateBookContentAttachment(attachment.id)({
    raw: updatedImageKey,
    delta_object: captionsFromPayload(payload),
  })

  return {
    ...updated.toJSON(),
    url: generatePresignedUrl(updated.get('raw')),
    delta_object: null,
    ...updated.get('delta_object'),
  }
}
