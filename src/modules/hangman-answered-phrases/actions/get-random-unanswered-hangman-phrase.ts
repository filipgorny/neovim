import { int } from '@desmart/js-utils'
import { create, findOne, patch } from '../hangman-answered-phrases-repository'
import { getRandomPhraseWhereOrderNotInByCategory } from '../../hangman-phrases/hangman-phrases-service'
import { HangmanPhraseCategory } from '../../hangman-phrases/hangman-phrases-categories-enum'

type Payload = {
  category: HangmanPhraseCategory | 'RANDOM'
}

export default async (student_id: string, payload: Payload) => {
  const { category } = payload
  const answeredPhrases = await findOne({ student_id, category })

  if (answeredPhrases) {
    let answeredPhrasesOrders = []
    if (answeredPhrases.answered_phrases_orders !== '') {
      answeredPhrasesOrders = answeredPhrases.answered_phrases_orders.split(',').map(int)
    }

    let randomUnansweredPhraseOrder = await getRandomPhraseWhereOrderNotInByCategory(category, answeredPhrasesOrders)

    if (!randomUnansweredPhraseOrder) {
      await patch(answeredPhrases.id, { answered_phrases_orders: '' })
      randomUnansweredPhraseOrder = await getRandomPhraseWhereOrderNotInByCategory(category, [])
    }

    return randomUnansweredPhraseOrder
  } else {
    await create({ student_id, category, answered_phrases_orders: '' })
    return getRandomPhraseWhereOrderNotInByCategory(category, [])
  }
}
