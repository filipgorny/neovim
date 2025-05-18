import * as R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import HangmanHintDTO from '../../hangman-hints/dto/hangman-hint-dto'
import HangmanPhraseDTO from '../dto/hangman-phrase-dto'
import { create as createPhrase } from '../hangman-phrases-repository'
import { create as createHint } from '../../hangman-hints/hangman-hints-repository'

export type HangmanPhraseWithHintsDTO = HangmanPhraseDTO & {
  hints: Array<Omit<HangmanHintDTO, 'phrase_id'>>
  image_hint?: string
}

export default async (dto: HangmanPhraseWithHintsDTO) => {
  const hints = []

  const result = await createPhrase({
    ...R.omit(['hints', 'phrase_delta_object'], dto),
    phrase_delta_object: typeof dto.phrase_delta_object === 'string' ? dto.phrase_delta_object : JSON.stringify(dto.phrase_delta_object),
  })

  for (const hintDto of dto.hints) {
    const hint = await createHint({
      phrase_id: result.get('id'),
      ...hintDto,
      hint_delta_object: typeof hintDto.hint_delta_object === 'string' ? hintDto.hint_delta_object : JSON.stringify(hintDto.hint_delta_object),
    })
    hints.push(hint.toJSON())
  }

  return {
    ...result.toJSON(),
    image_hint: generateStaticUrl(result.get('image_hint')),
    hints: R.sortBy(R.prop('order'), hints),
  }
}
