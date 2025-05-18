import { HangmanPhraseCategory } from '../../hangman-phrases/hangman-phrases-categories-enum'
import { findOneOrFail as findPhraseOrFail } from '../../hangman-phrases/hangman-phrases-repository'
import { create, findOne, patch } from '../hangman-answered-phrases-repository'

type Payload = {
  category: HangmanPhraseCategory | 'RANDOM'
  answered_phrase_order: number
}

export default async (student_id: string, payload: Payload) => {
  await findPhraseOrFail({ order: payload.answered_phrase_order })

  const answeredPhrases = await findOne({ student_id, category: payload.category })

  if (!answeredPhrases) {
    return create({ student_id, category: payload.category, answered_phrases_orders: `${payload.answered_phrase_order}` })
  } else {
    return patch(answeredPhrases.id, { answered_phrases_orders: `${answeredPhrases.answered_phrases_orders !== '' ? `${answeredPhrases.answered_phrases_orders},` : ''}${payload.answered_phrase_order}` })
  }
}
