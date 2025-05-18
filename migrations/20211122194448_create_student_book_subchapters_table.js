const tableName = 'student_book_subchapters'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable()
    table.uuid('chapter_id').notNullable().index()
    table.uuid('original_subchapter_id').notNullable().index()
    table.integer('order').notNullable()
    table.integer('part').notNullable()

    table
    .foreign('chapter_id')
    .references('id')
    .inTable('student_book_chapters')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
