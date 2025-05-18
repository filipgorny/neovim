import R from 'ramda'
import validateEntityPayload from '../../../../utils/validation/validate-entity-payload'
import { schema, fileSchema } from '../validation/schema/create-image-schema'
import { findOneOrFail as findContent } from '../../book-contents/book-content-repository'
import { createBookContentImage } from '../book-content-image-service'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { validateFileMimeType } from '../validation/validate-file-payload'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_BOOK_CONTENT_IMAGE } from '../../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../../services/s3/generate-static-url'

const uploadImageToS3 = async image => {
  if (!image) return undefined

  validateFileMimeType(image.mimetype)

  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_BOOK_CONTENT_IMAGE, true)

  return key
}

const getNextOrderFromBookContent = content => (
  R.pipe(
    R.prop('images'),
    R.length,
    R.inc
  )(content)
)

const prepareAndSaveNewImage = async (contentId, files) => {
  const content = await findContent({ id: contentId }, ['images'])
  const image = files.image
  const smallVer = files.smallVer
  const order = getNextOrderFromBookContent(content)
  const created = await createBookContentImage(
    content.id,
    order,
    await uploadImageToS3(image),
    await uploadImageToS3(smallVer)
  )

  return {
    ...created.toJSON(),
    image: generateStaticUrl(created.get('image')),
    small_ver: generateStaticUrl(created.get('small_ver')),
  }
}

export default async (files, payload) => {
  validateEntityPayload(schema)(payload)
  validateFilesPayload(fileSchema)(files)

  return prepareAndSaveNewImage(payload.contentId, files)
}
