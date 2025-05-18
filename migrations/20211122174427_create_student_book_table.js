const tableName = 'student_books'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.string('external_id').notNullable()
    table.uuid('student_id').notNullable().index()
    table.uuid('book_id').notNullable().index()
    table.uuid('course_id').notNullable().index()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
    table.date('external_created_at')
    table.string('tag')
    table.string('tag_colour')

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')

    table
      .foreign('course_id')
      .references('id')
      .inTable('book_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
