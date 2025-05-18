/* eslint-disable @typescript-eslint/no-floating-promises */
import orm from '../../src/models'
import * as R from 'ramda'
import mapP from '../../utils/function/mapp'
import { copyQuestionById } from '../../src/modules/questions/question-service'

const { knex } = orm.bookshelf;

(async () => {
  console.log('start archiving questions attached to removed contents')

  let questionIds = await knex
    .select('q.id')
    .from({ q: 'questions' })
    .leftJoin({ bcq: 'book_content_questions' }, 'q.id', 'bcq.question_id')
    .leftJoin({ bc: 'book_contents' }, 'bc.id', 'bcq.content_id')
    .whereNotNull('bc.deleted_at')
    .where('q.is_archived', false)
  questionIds = R.pluck('id', questionIds)

  await mapP(
    copyQuestionById
  )(questionIds)

  await knex('questions').whereIn('id', questionIds).update({ is_archived: true })

  console.log('done')
  process.exit(0)
})()
