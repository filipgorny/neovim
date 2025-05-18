const tableName_20211015165246_BookContentResources = 'book_content_resources'

exports.up = async knex => up_20211015165246(knex)
exports.down = async knex => down_20211015165246(knex)

const up_20211015165246 = knex =>
  knex.schema.table(tableName_20211015165246_BookContentResources, table => {
    table.dropForeign('content_id')

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
    .onDelete('CASCADE')
  })

const down_20211015165246 = knex => 
  knex.schema.table(tableName_20211015165246_BookContentResources, table => {
    table.dropForeign('content_id')

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
  })
