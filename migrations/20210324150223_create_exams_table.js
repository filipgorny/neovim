const tableName = 'exams'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('layout_id').notNullable()
    table.string('title')
    table.string('file_name')
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.uuid('uploaded_by').notNullable()
    table.boolean('is_active').defaultTo(true)

    table
      .foreign('layout_id')
      .references('id')
      .inTable('layouts')

    table
      .foreign('uploaded_by')
      .references('id')
      .inTable('admins')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
