const tableName = 'book_chapters'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable().unique()
    table.uuid('book_id').notNullable().index()
    table.integer('order').notNullable()

    table
    .foreign('book_id')
    .references('id')
    .inTable('books')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
