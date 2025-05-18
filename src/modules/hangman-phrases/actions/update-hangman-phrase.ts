import generateStaticUrl from '../../../../services/s3/generate-static-url'
import HangmanPhraseDTO from '../dto/hangman-phrase-dto'
import { patch } from '../hangman-phrases-repository'
import { uploadHangmanHintImageToS3 } from './create-hangman-phrase'

export default async (id: string, files, dto: Partial<HangmanPhraseDTO>) => {
  const imageHintKey = await uploadHangmanHintImageToS3(files?.image)

  const result = await patch(id, {
    ...dto,
    ...(dto.phrase_delta_object ? { phrase_delta_object: typeof dto.phrase_delta_object === 'string' ? dto.phrase_delta_object : JSON.stringify(dto.phrase_delta_object) } : {}),
    ...(files ? { image_hint: imageHintKey } : {}),
    updated_at: new Date(),
  })

  return {
    ...result.toJSON(),
    image_hint: generateStaticUrl(result.get('image_hint')),
  }
}
