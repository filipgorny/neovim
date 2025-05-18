import R from 'ramda'
import { fileSchema } from '../validation/schema/update-image-schema'
import { findOneOrFail as findChapterImage } from '../book-chapter-images-repository'
import { updateBookChapterImage } from '../book-chapter-images-service'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { validateFileMimeType } from '../validation/validate-file-payload'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_BOOK_CONTENT_IMAGE } from '../../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../../services/s3/generate-static-url'

const uploadImageToS3 = async (image, prevImage, payloadImage) => {
  if (!image) {
    if (payloadImage === null || payloadImage === 'null') {
      return null
    }

    return undefined
  }

  validateFileMimeType(image.mimetype)

  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_BOOK_CONTENT_IMAGE, true)

  return key
}

const prepareAndSaveNewImage = async (id, files, payload) => {
  const chapterImage = await findChapterImage({ id })
  const image = R.propOr(undefined, 'image')(files)
  const smallVer = R.propOr(undefined, 'smallVer')(files)
  const updated = await updateBookChapterImage(
    chapterImage.id,
    await uploadImageToS3(image, chapterImage.image, payload.image),
    await uploadImageToS3(smallVer, chapterImage.smallVer, payload.smallVer)
  )

  return {
    ...updated.toJSON(),
    image: generateStaticUrl(updated.get('image')),
    small_ver: generateStaticUrl(updated.get('small_ver')),
  }
}

export default async (id, files, payload) => {
  if (files) {
    validateFilesPayload(fileSchema)(files)
  }

  return prepareAndSaveNewImage(id, files, payload)
}
