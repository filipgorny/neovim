const tableName = 'book_chapter_images'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('chapter_id').notNullable()
    table.string('image').notNullable()
    table.string('small_ver').notNullable()
    table.integer('order').notNullable()

    table
      .foreign('chapter_id')
      .references('id')
      .inTable('book_chapters')
  })

const dropTable = knex => knex.schema.dropTable(tableName)

