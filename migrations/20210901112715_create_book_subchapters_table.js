const tableName = 'book_subchapters'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.string('title').notNullable().unique()
    table.uuid('chapter_id').notNullable().index()
    table.integer('order').notNullable()

    table
    .foreign('chapter_id')
    .references('id')
    .inTable('book_chapters')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
