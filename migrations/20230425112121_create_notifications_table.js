const tableName = 'notifications'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('type').notNullable()
    table.uuid('author_id').notNullable()
    table.timestamp('created_at').notNullable()
    table.timestamp('scheduled_for').nullable() // when scheduled
    table.timestamp('deleted_at').nullable()
    table.text('recurring_definition').nullable()
    table.text('title_raw').notNullable()
    table.text('title_delta_object').notNullable()
    table.text('title_html').notNullable()
    table.text('description_raw').notNullable()
    table.text('description_delta_object').notNullable()
    table.text('description_html').notNullable()
    table.text('student_groups').notNullable()

    table
      .foreign('author_id')
      .references('id')
      .inTable('admins')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
