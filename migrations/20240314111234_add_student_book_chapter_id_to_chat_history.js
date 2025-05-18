const tableName = 'chat_history'
const columnName = 'student_book_chapter_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).index().notNullable()

    table
      .foreign(columnName)
      .references('id')
      .inTable('student_book_chapters')
      .onDelete('CASCADE')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
