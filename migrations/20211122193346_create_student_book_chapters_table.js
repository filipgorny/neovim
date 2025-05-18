const tableName = 'student_book_chapters'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.uuid('book_id').notNullable().index()
    table.uuid('original_chapter_id').notNullable().index()
    table.integer('order').notNullable()

    table
    .foreign('book_id')
    .references('id')
    .inTable('student_books')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
