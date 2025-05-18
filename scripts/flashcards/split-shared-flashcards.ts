/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import { splitFlashcardById } from '../../src/modules/flashcards/flashcard-service'
import orm from '../../src/models'
import mapP from '../../utils/function/mapp'

const { knex } = orm.bookshelf;

(async () => {
  console.log('start splitting flashcards')

  const RECORDS_PER_BATCH = 20

  const flashcards = await knex.select('id').from('flashcards')

  for (let i = 0; i < flashcards.length; i += RECORDS_PER_BATCH) {
    await mapP(
      async ({ id }) => splitFlashcardById(id)
    )(R.slice(i, i + RECORDS_PER_BATCH, flashcards))
  }

  console.log('done splitting flashcards')
  process.exit(0)
})()
