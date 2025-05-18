const tableName = 'book_erratas'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('book_id').notNullable()
    table.uuid('chapter_id').notNullable()
    table.uuid('subchapter_id').notNullable()
    table.string('type').notNullable().defaultTo('text')
    table.text('content_delta_object').notNullable()
    table.text('content_raw').notNullable()
    table.text('content_html').notNullable()
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    table.uuid('created_by').notNullable()

    table
      .foreign('book_id')
      .references('id')
      .inTable('books')
      .onDelete('CASCADE')

    table
      .foreign('chapter_id')
      .references('id')
      .inTable('book_chapters')
      .onDelete('CASCADE')

    table
      .foreign('subchapter_id')
      .references('id')
      .inTable('book_subchapters')
      .onDelete('CASCADE')

    table
      .foreign('created_by')
      .references('id')
      .inTable('admins')
      .onDelete('CASCADE')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
