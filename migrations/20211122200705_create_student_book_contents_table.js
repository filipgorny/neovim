const tableName = 'student_book_contents'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.text('raw').notNullable()
    table.text('delta_object').notNullable()
    table.string('type').notNullable()
    table.string('content_status').notNullable()
    table.uuid('subchapter_id').notNullable().index()
    table.uuid('original_content_id').notNullable().index()
    table.integer('order').notNullable()

    table
    .foreign('subchapter_id')
    .references('id')
    .inTable('student_book_subchapters')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
