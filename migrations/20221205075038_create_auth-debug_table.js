const tableName = 'auth_debug'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.text('token').notNullable()
    table.dateTime('created_at').defaultTo(knex.fn.now())
  })

const dropTable = knex => knex.schema.dropTable(tableName)
