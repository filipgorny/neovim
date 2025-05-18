const tableName = 'app_settings'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('namespace').notNullable()
    table.string('name').notNullable()
    table.string('value').notNullable()

    table.unique(['namespace', 'name'])
  })

const dropTable = knex => knex.schema.dropTable(tableName)
