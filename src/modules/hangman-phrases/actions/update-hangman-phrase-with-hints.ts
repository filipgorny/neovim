import * as R from 'ramda'
import generateStaticUrl from '../../../../services/s3/generate-static-url'
import { patch } from '../hangman-phrases-repository'
import { HangmanPhraseWithHintsDTO } from './create-hangman-phrase-with-hints'
import { deleteByPhraseId, create as createHint } from '../../hangman-hints/hangman-hints-repository'

export default async (id: string, dto: Partial<HangmanPhraseWithHintsDTO>) => {
  const result = await patch(id, {
    ...R.pipe(
      R.omit(['hints', 'phrase_delta_object']),
      R.over(R.lensProp('image_hint'), R.when(R.is(String), R.replace(generateStaticUrl(''), '')))
    )(dto),
    ...(dto.phrase_delta_object ? { phrase_delta_object: typeof dto.phrase_delta_object === 'string' ? dto.phrase_delta_object : JSON.stringify(dto.phrase_delta_object) } : {}),
    updated_at: new Date(),
  })

  const hints = []

  if (dto.hints) {
    await deleteByPhraseId(id)

    for (const hintDto of dto.hints) {
      const hint = await createHint({
        phrase_id: id,
        ...hintDto,
        hint_delta_object: typeof hintDto.hint_delta_object === 'string' ? hintDto.hint_delta_object : JSON.stringify(hintDto.hint_delta_object),
      })
      hints.push(hint.toJSON())
    }
  }

  return {
    ...result.toJSON(),
    image_hint: generateStaticUrl(result.get('image_hint')),
    hints: R.sortBy(R.prop('order'), hints),
  }
}
