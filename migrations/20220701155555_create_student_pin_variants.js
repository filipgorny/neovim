const tableName = 'student_pin_variants'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('student_id').notNullable()
    table.uuid('student_book_id').notNullable()
    table.string('variant').notNullable()
    table.string('title')

    table.unique(['student_id', 'student_book_id', 'variant'])

    table
      .foreign('student_id')
      .references('id')
      .inTable('students')

    table
      .foreign('student_book_id')
      .references('id')
      .inTable('student_books')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
