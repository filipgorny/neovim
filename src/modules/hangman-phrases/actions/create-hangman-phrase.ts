import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { S3_PREFIX_HANGMAN_HINT_IMAGE } from '../../../../services/s3/s3-file-prefixes'
import uploadFile from '../../../../services/s3/upload-file'
import { validateFileMimeType } from '../../book-chapter-images/validation/validate-file-payload'
import HangmanPhraseDTO from '../dto/hangman-phrase-dto'
import { create } from '../hangman-phrases-repository'

export const uploadHangmanHintImageToS3 = async image => {
  if (!image) return undefined

  validateFileMimeType(image.mimetype)

  const key = await uploadFile(image.data, image.mimetype, S3_PREFIX_HANGMAN_HINT_IMAGE, true)

  return key
}

export default async (files, dto: HangmanPhraseDTO) => {
  const imageHint = files?.image
  const imageHintKey = await uploadHangmanHintImageToS3(imageHint)

  const result = await create({
    ...dto,
    phrase_delta_object: typeof dto.phrase_delta_object === 'string' ? dto.phrase_delta_object : JSON.stringify(dto.phrase_delta_object),
    ...(files ? { image_hint: imageHintKey } : {}),
  })

  return {
    ...result.toJSON(),
    image_hint: generateStaticUrl(result.get('image_hint')),
  }
}
