const tableName = 'student_exam_questions'

const columnChecking = 'checking'
const columnReading = 'reading'
const columnWorking = 'working'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.integer(columnChecking).nullable()
    table.integer(columnReading).nullable()
    table.integer(columnWorking).nullable()
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnChecking)
    table.dropColumn(columnReading)
    table.dropColumn(columnWorking)
  })
)
