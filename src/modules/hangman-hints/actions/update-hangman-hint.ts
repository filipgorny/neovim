import HangmanHintDTO from '../dto/hangman-hint-dto'
import { patch } from '../hangman-hints-repository'

export default async (id: string, dto: Omit<HangmanHintDTO, 'phrase_id'>) => (
  patch(id, {
    ...dto,
    hint_delta_object: typeof dto.hint_delta_object === 'string' ? dto.hint_delta_object : JSON.stringify(dto.hint_delta_object),
  })
)
