const tableName = 'custom_event_types'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('custom_event_group_id').nullable().index()
    table.string('title').notNullable()
    table.string('slug').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('custom_event_group_id')
      .references('id')
      .inTable('custom_event_groups')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
