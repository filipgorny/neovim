const tableName = 'chapter_admins'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('admin_id').notNullable().index()
    table.uuid('chapter_id').notNullable().index()
    table.uuid('book_id').notNullable().index()

    table
      .foreign('admin_id')
      .references('id')
      .inTable('admins')
      
    table
      .foreign('chapter_id')
      .references('id')
      .inTable('book_chapters')

    table
      .foreign('book_id')
      .references('id')
      .inTable('books')

    table.primary(['admin_id', 'chapter_id'])
  })

const dropTable = knex => knex.schema.dropTable(tableName)
