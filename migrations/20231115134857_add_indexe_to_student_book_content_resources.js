const tableName = 'student_book_content_resources'
const columnName = 'external_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.alterTable(tableName, table => {
    table.uuid(columnName).index().alter()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropIndex(columnName)
  })
)
