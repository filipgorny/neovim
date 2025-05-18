const tableName = 'student_book_content_pins'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable()
    table.string('variant').notNullable()
    table.string('note').notNullable()

    table
      .foreign('content_id')
      .references('id')
      .inTable('student_book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
