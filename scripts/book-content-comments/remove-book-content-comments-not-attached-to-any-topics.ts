import orm from '../../src/models'

const { knex } = orm.bookshelf;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Start remvoing book content comments not attached to any topics...')

  await knex.raw(`
    delete from book_content_comments where id in (
      select bcc.id
      from book_content_comments bcc
      where not exists (select * from book_content_course_topics  bcct where bcct.book_content_id = bcc.book_content_id)
    );
  `)

  console.log('Done')

  process.exit(0)
})()
