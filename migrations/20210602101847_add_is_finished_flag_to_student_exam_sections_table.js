const tableName = 'student_exam_sections'
const columnName = 'is_finished'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(false)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
