import { customException, int, throwException } from '@desmart/js-utils'
import HangmanHintDTO from '../dto/hangman-hint-dto'
import { countHints, create } from '../hangman-hints-repository'

export default async (dto: HangmanHintDTO) => {
  const count = await countHints(dto.phrase_id)

  if (count >= 5) {
    throwException(customException('hangman-hints.max-hints-reached', 400, 'Max hints reached. 5 hints per phrase allowed'))
  }

  return create({
    ...dto,
    hint_delta_object: typeof dto.hint_delta_object === 'string' ? dto.hint_delta_object : JSON.stringify(dto.hint_delta_object),
    order: int(count) + 1,
  })
}
