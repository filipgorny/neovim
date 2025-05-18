const tableName = 'student_book_content_resources'
const columnName = 'content_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    // table
    //   .foreign(columnName)
    //   .references('id')
    //   .inTable('student_book_contents')
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    // table.dropForeign(columnName)
  })
)
