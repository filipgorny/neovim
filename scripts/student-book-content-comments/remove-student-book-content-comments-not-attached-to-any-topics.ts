import orm from '../../src/models'

const { knex } = orm.bookshelf;

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  console.log('Start remvoing student book content comments not attached to any topics...')

  await knex.raw(`
    delete from student_book_content_comments where id in (
      select sbcc.id
      from student_book_content_comments sbcc
      left join student_book_contents sbc 
        on sbcc.original_book_content_id = sbc.original_content_id 
          and get_student_course_id_by_student_book_content_id(sbc.id) = sbcc.student_course_id
      where not exists (select * from student_book_content_course_topics sbcct where sbcct.student_course_id = sbcc.student_course_id and sbcct.student_book_content_id = sbc.id)
    );
  `)

  console.log('Done')

  process.exit(0)
})()
