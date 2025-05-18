const tableName = 'course_end_date_days'
const columnName = 'book_chapter_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnName).nullable()

    table
      .foreign('book_chapter_id')
      .references('id')
      .inTable('book_chapters')
      .onDelete('CASCADE')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
