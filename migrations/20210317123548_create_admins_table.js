const tableName = 'admins'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('email').notNullable()
    table.string('password').notNullable()
    table.string('admin_role').notNullable()
    table.boolean('is_active').defaultTo(true)
  })

const dropTable = knex => knex.schema.dropTable(tableName)
