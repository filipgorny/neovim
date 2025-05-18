import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { schema, fileSchema } from '../validation/schema/update-file-book-content-schema'
import { updateBookContent } from '../book-content-service'
import { findOneOrFail } from '../book-content-repository'
import { BookContentTypeEnum } from '../book-content-types'
import { validateFileMimeType } from '../validation/validate-file-mime-type'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_BOOK_CONTENT } from '../../../../services/s3/s3-file-prefixes'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'

const prepareDelta = (shouldUpdate, currentDelta, payload) => {
  if (!shouldUpdate) return

  validateEntityPayload(schema)(payload)

  return {
    ...currentDelta,
    main_caption: payload.mainCaption,
    secondary_caption: payload.secondaryCaption,
  }
}

const prepareFileReupload = async (shouldUpdate, currentKey, files) => {
  if (!shouldUpdate) return

  validateFilesPayload(fileSchema)(files)
  validateFileMimeType(files.image.mimetype)

  const uploaded = await uploadFile(files.image.data, files.image.mimetype, S3_PREFIX_BOOK_CONTENT)

  return uploaded
}

export default async (id: string, files, payload) => {
  const content = await findOneOrFail({ id, type: BookContentTypeEnum.file })
  const shouldReuploadFile = Boolean(files)
  const shouldUpdateDeltaObject = !R.converge(
    R.or, [
      R.isNil,
      R.isEmpty,
    ])(payload)

  const updatedDeltaObject = prepareDelta(shouldUpdateDeltaObject, content.delta_object, payload)
  const updatedImageKey = await prepareFileReupload(shouldReuploadFile, content.raw, files)

  const updated = await updateBookContent(content.id)({
    raw: updatedImageKey,
    delta_object: updatedDeltaObject,
  })

  return {
    ...updated.toJSON(),
    url: generatePresignedUrl(updated.get('raw')),
    delta_object: null,
    ...updated.get('delta_object'),
  }
}
