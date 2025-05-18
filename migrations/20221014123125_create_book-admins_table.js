const tableName = 'book_admins'

exports.up = async knex => createTable(knex)
exports.down = async knex => dropTable(knex)

const createTable = knex =>
  knex.schema.createTable(tableName, table => {
    table.uuid('id').primary()
    table.uuid('admin_id')
    table.uuid('book_id')
    table.string('permission')

    table.unique(['admin_id', 'book_id', 'permission'])

    table
      .foreign('admin_id')
      .references('id')
      .inTable('admins')

    table
      .foreign('book_id')
      .references('id')
      .inTable('books')
  })

const dropTable = knex => knex.schema.dropTable(tableName)
