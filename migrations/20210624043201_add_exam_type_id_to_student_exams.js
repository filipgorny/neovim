const tableName = 'student_exams'
const columnName = 'exam_type_id'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = async (knex) => knex.schema.table(tableName, table => {
    table.uuid(columnName)
  })

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
