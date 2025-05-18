const tableName = 'organizations'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title')
    table.string('title_slug').unique()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

const dropTable = knex => knex.schema.dropTable(tableName)
