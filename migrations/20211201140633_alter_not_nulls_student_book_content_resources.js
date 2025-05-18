const tableName = 'student_book_content_resources'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.uuid('external_id').nullable().alter()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.uuid('external_id').nullable().alter()
  })
)
