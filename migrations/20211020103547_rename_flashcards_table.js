const tableName = 'flashcards'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => {
  await knex.schema.renameTable('book_content_flashcards', tableName)
  await knex.schema.table(tableName, table => {
    table.dropColumn('content_id')
  })
}

const down = async knex => {
  await knex.schema.table(tableName, table => {
    table.uuid('content_id')

    table
      .foreign('content_id')
      .references('id')
      .inTable('book_contents')
  })

  await knex.schema.renameTable(tableName, 'book_content_flashcards')
}
