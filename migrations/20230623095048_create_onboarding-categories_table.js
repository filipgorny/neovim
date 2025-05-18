const tableName = 'onboarding_categories'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.integer('order').notNullable()
  })

const dropTable = knex => knex.schema.dropTable(tableName)
