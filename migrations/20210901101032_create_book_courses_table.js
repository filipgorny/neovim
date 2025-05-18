const tableName = 'book_courses'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable().unique()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('deleted_at')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
