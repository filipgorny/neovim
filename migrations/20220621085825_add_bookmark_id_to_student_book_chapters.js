const tableName = 'student_book_chapters'
const columnName = 'bookmark_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex =>
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('student_book_contents')
  })

const down = knex => 
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
