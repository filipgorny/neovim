import R from 'ramda'
import { fileSchema } from '../validation/schema/create-image-schema'
import { createBookChapterImage } from '../book-chapter-images-service'
import validateFilesPayload from '../../../../utils/validation/validate-files-payload'
import { validateFileMimeType } from '../validation/validate-file-payload'
import uploadFile from '../../../../services/s3/upload-file'
import { S3_PREFIX_BOOK_CHAPTER_IMAGE } from '../../../../services/s3/s3-file-prefixes'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { findOneOrFail as findChapter } from '../../book-chapters/book-chapter-repository'

const uploadImageToS3 = async image => {
  if (!image) return undefined

  validateFileMimeType(image.mimetype)

  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_BOOK_CHAPTER_IMAGE, true)

  return key
}

const getNextOrderFromBookContent = content => (
  R.pipe(
    R.prop('images'),
    R.length,
    R.inc
  )(content)
)

const prepareAndSaveNewImage = async (chapterId, files) => {
  const chapter = await findChapter({ id: chapterId }, ['images'])
  const image = files.image
  const smallVer = files.smallVer
  const order = getNextOrderFromBookContent(chapter)
  const created = await createBookChapterImage(
    chapter.id,
    order,
    await uploadImageToS3(image),
    await uploadImageToS3(smallVer),
  )

  return {
    ...created.toJSON(),
    image: generateStaticUrl(created.get('image')),
    small_ver: generateStaticUrl(created.get('small_ver')),
  }
}

export default async (files, payload) => {
  validateFilesPayload(fileSchema)(files)

  return prepareAndSaveNewImage(payload.chapterId, files)
}
