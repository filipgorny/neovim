const tableName = 'TABLE_NAME'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
