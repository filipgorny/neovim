const tableName = 'student_flashcard_archive'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_flashcard_id').notNullable().unique()
    table.uuid('student_course_id').notNullable()

    table
      .foreign('student_flashcard_id')
      .references('id')
      .inTable('student_book_content_flashcards')

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
