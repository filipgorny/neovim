const tableName = 'student_flashcard_boxes'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_course_id').notNullable()
    table.uuid('student_book_id').notNullable()
    table.string('title').notNullable()

    table.unique(['student_course_id', 'title'])

    table
      .foreign('student_course_id')
      .references('id')
      .inTable('student_courses')

    table
      .foreign('student_book_id')
      .references('id')
      .inTable('student_books')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
