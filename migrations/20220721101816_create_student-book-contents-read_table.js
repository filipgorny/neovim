const tableName = 'student_book_contents_read'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('student_course_id').notNullable()
    table.uuid('student_book_id').notNullable()
    table.date('updated_at').notNullable()
    table.integer('content_read_amount').notNullable().defaultTo(0)

    table.unique(['student_course_id', 'student_book_id', 'updated_at'])

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
  })

const dropTable = knex => knex.schema.dropTable(tableName)
