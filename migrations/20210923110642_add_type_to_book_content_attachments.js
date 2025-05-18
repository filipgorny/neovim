const tableName = 'book_content_attachments'
const columnName = 'type'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.string(columnName)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
