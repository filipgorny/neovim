const tableName = 'book_content_flashcards'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable().index()
    table.text('question').notNullable()
    table.text('explanation').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
