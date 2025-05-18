const tableName = 'flashcard_activity_timers'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('student_course_id').notNullable()
    table.uuid('student_book_id').notNullable()
    table.uuid('flashcard_id').notNullable() // it's actually student_book_content_resources.id
    table.integer('seconds').notNullable()
    table.date('activity_date').nullable()

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')

    table
      .foreign('student_book_id')
      .references('id')
      .inTable('student_books')

    table
      .foreign('flashcard_id')
      .references('id')
      .inTable('student_book_content_flashcards')
  })

const dropTable = knex => knex.schema.dropTable(tableName)

