const tableName = 'student_book_content_course_topics'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.uuid('student_book_id').notNullable()
    table.uuid('student_book_content_id').notNullable()
    table.uuid('student_course_topic_id').notNullable()
    table.boolean('is_read').defaultTo(false)

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')

    table
      .foreign('student_book_id')
      .references('id')
      .inTable('student_books')

    table
      .foreign('student_book_content_id')
      .references('id')
      .inTable('student_book_contents')

    table
      .foreign('student_course_topic_id')
      .references('id')
      .inTable('student_course_topics')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
