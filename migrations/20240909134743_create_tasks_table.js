const tableName = 'tasks'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('name').notNullable()
    table.json('content').notNullable()
    table.boolean('is_active').notNullable().defaultTo(true)
    table.integer('order').notNullable()
    table.string('type').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })

const dropTable = knex => knex.schema.dropTable(tableName)
