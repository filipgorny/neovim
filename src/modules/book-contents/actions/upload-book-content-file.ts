import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { schema, fileSchema } from '../validation/schema/upload-book-content-file-schema'
import { findOneOrFail as findSubchapter } from '../../book-subchapters/book-subchapter-repository'
import { fixBookContentOrderAfterAdding } from '../book-content-repository'
import { createBookContent } from '../book-content-service'
import { BookContentTypeEnum } from '../book-content-types'
import uploadFile from '../../../../services/s3/upload-file'
import { validateFileMimeType } from '../validation/validate-file-mime-type'
import { S3_PREFIX_BOOK_CONTENT } from '../../../../services/s3/s3-file-prefixes'
import generatePresignedUrl from '../../../../services/s3/generate-presigned-url'

const prepareAndSaveNewSubchapter = async (subchapter, raw, order, main_caption, secondary_caption) => {
  await fixBookContentOrderAfterAdding(subchapter.id, order)

  const content = await createBookContent(BookContentTypeEnum.file, order, raw, {
    main_caption,
    secondary_caption,
  }, subchapter.id)

  return {
    ...content.toJSON(),
    url: generatePresignedUrl(content.get('raw')),
    delta_object: null,
    ...content.get('delta_object'),
  }
}

export default async (files, payload) => {
  validateEntityPayload(schema)(payload)
  validateFilesPayload(fileSchema)(files)

  const { image } = files
  const { subchapterId, order, mainCaption, secondaryCaption } = payload

  validateFileMimeType(image.mimetype)

  const subchapter = await findSubchapter({ id: subchapterId })
  const imageKey = await uploadFile(image.data, image.mimetype, S3_PREFIX_BOOK_CONTENT)

  return prepareAndSaveNewSubchapter(subchapter, imageKey, order, mainCaption, secondaryCaption)
}
