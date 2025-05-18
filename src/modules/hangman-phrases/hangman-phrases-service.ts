import * as R from 'ramda'
import orm from '../../models'
import { RANDOM } from '../hangman-answered-phrases/validation/schema/get-random-unanswered-hangman-phrase-schema'
import { HangmanPhraseCategory } from './hangman-phrases-categories-enum'
import { findOneOrFail } from './hangman-phrases-repository'
import generateStaticUrl from '../../../services/s3/generate-static-url'

const { knex } = orm.bookshelf

export const getRandomPhraseWhereOrderNotInByCategory = async (category: HangmanPhraseCategory | 'RANDOM', answeredPhrasesOrders: number[]) => {
  let qb = knex('hangman_phrases').select('order')

  if (category !== RANDOM) {
    qb = qb.where({ category })
  }

  const [phrase] = await qb
    .whereNotIn('order', answeredPhrasesOrders)
    .whereNull('deleted_at')
    .orderByRaw('RANDOM()')
    .limit(1)

  if (phrase) {
    const result = await findOneOrFail({ order: phrase.order }, ['hints'])

    return {
      ...result,
      image_hint: generateStaticUrl(result.image_hint),
      hints: R.sortBy(R.prop('order'), result.hints),
    }
  }
}
