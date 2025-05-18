/* eslint-disable @typescript-eslint/no-floating-promises */
import orm from '../../src/models'
import * as R from 'ramda'
import { copyFlashcardById } from '../../src/modules/flashcards/flashcard-service'
import mapP from '../../utils/function/mapp'

const { knex } = orm.bookshelf;

(async () => {
  console.log('start archiving flashcards attached to removed contents')

  let flashcardIds = await knex
    .select('f.id')
    .from({ f: 'flashcards' })
    .leftJoin({ bcf: 'book_content_flashcards' }, 'f.id', 'bcf.flashcard_id')
    .leftJoin({ bc: 'book_contents' }, 'bc.id', 'bcf.content_id')
    .whereNotNull('bc.deleted_at')
    .where('f.is_archived', false)
  flashcardIds = R.pluck('id', flashcardIds)

  await mapP(
    copyFlashcardById
  )(flashcardIds)

  await knex('flashcards').whereIn('id', flashcardIds).update({ is_archived: true })

  console.log('done')
  process.exit(0)
})()
