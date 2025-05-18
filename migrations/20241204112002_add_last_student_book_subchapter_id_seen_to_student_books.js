const tableName = 'student_books'
const columnNameA = 'last_student_book_subchapter_id_seen'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnNameA).nullable()

    table
      .foreign(columnNameA)
      .references('id')
      .inTable('student_book_subchapters')
      .onDelete('CASCADE')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })
)
