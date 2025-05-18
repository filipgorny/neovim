const tableName = 'user_tokens'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('user_id').unique().notNullable()
    table.uuid('token').unique()
    table.dateTime('expires_at')

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
