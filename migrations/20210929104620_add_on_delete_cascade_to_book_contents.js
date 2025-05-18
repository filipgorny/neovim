const tableName = 'book_contents'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.table(tableName, table => {
    table.dropForeign('subchapter_id')

    table
    .foreign('subchapter_id')
    .references('id')
    .inTable('book_subchapters')
    .onDelete('CASCADE')
  })

const dropTable = knex => 
  knex.schema.table(tableName, table => {
    table.dropForeign('subchapter_id')

    table
    .foreign('subchapter_id')
    .references('id')
    .inTable('book_subchapters')
  })
