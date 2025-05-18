const tableName = 'flashcards'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.dropPrimary('book_content_flashcards_pkey')
    table.primary('id')
    table.timestamp('deleted_at').nullable()
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropPrimary()
    table.primary('id', 'book_content_flashcards_pkey')
    table.dropColumn('deleted_at')
  })
