const tableName = 'book_content_flashcards'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('content_id').notNullable()
    table.uuid('flashcard_id').notNullable()
    table.primary(['content_id', 'flashcard_id'])

    table
      .foreign('content_id')
      .references('id')
      .inTable('book_contents')
    table
      .foreign('flashcard_id')
      .references('id')
      .inTable('flashcards')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
