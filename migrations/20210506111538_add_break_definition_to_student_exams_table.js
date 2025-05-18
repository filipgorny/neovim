const tableName = 'student_exams'
const columnName = 'break_definition'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.text(columnName)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
