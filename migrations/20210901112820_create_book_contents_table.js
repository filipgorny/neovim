const tableName = 'book_contents'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('details').notNullable()
    table.string('type').notNullable()
    table.uuid('subchapter_id').notNullable().index()
    table.integer('order').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
    .foreign('subchapter_id')
    .references('id')
    .inTable('book_subchapters')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
