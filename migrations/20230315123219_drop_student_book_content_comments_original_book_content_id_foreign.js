const tableName = 'student_book_content_comments'
const columnName = 'original_book_content_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.dropForeign(columnName)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table
      .foreign(columnName)
      .references('id')
      .inTable('book_contents')
  })
)
