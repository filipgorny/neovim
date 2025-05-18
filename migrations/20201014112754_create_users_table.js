const tableName = 'users'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('email').unique()
    table.string('password')
    table.string('email_verification_token')
    table.boolean('is_email_verified').defaultTo(false)
    table.boolean('is_active').defaultTo(false)
  })

const dropTable = knex => knex.schema.dropTable(tableName)
