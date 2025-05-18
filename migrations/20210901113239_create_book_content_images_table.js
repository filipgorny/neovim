const tableName = 'book_content_images'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable().index()
    table.string('url').notNullable()
    table.integer('order').notNullable()

    table
    .foreign('content_id')
    .references('id')
    .inTable('book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
