/* eslint-disable @typescript-eslint/no-floating-promises */
import * as R from 'ramda'
import orm from '../../src/models'
import mapP from '../../utils/function/mapp'
import { splitQuestionById } from '../../src/modules/questions/question-service'

const { knex } = orm.bookshelf;

(async () => {
  console.log('start splitting questions')

  const RECORDS_PER_BATCH = 20

  const questions = await knex.select('id').from('questions')

  for (let i = 0; i < questions.length; i += RECORDS_PER_BATCH) {
    await mapP(
      async ({ id }) => splitQuestionById(id)
    )(R.slice(i, i + RECORDS_PER_BATCH, questions))
  }

  console.log('done splitting questions')
  process.exit(0)
})()
