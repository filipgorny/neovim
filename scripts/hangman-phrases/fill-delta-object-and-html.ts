/* eslint-disable @typescript-eslint/no-floating-promises */
import orm from '../../src/models'

const knex = orm.bookshelf.knex;

(async () => {
  console.log('Start filling delta object and html...')

  await knex.raw('UPDATE hangman_phrases SET phrase_delta_object = \'{"ops":[{"insert":"\' || phrase_raw || \'\\n"}]}\' WHERE phrase_delta_object IS NULL')
  await knex.raw('UPDATE hangman_phrases SET phrase_html = \'<div class="ql-editor" data-gramm="false" contenteditable="true" spellcheck="false"><p>\' || phrase_raw ||  \'</p></div>\' WHERE phrase_html IS NULL')

  console.log('Done')
  process.exit(0)
})()
