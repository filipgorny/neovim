const tableName = 'books'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable().unique()
    table.uuid('course_id').notNullable().index()
    table.timestamp('created_at').defaultTo(knex.fn.now())

    table
    .foreign('course_id')
    .references('id')
    .inTable('book_courses')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
