const tableName = 'student_book_content_resources'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('content_id').notNullable().index()
    table.uuid('original_resource_id').notNullable().index()
    table.text('raw').notNullable()
    table.text('delta_object').notNullable()
    table.uuid('external_id').notNullable()
    table.integer('order').notNullable()
    table.string('type').notNullable()

    table
    .foreign('content_id')
    .references('id')
    .inTable('student_book_contents')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
