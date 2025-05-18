const tableName = 'student_exams'
const columnNameIsIntact = 'is_intact'
const columnNameCompletedAt = 'completed_at'

exports.up = async knex => addColumn(knex)
exports.down = async knex => dropColumn(knex)

const addColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameIsIntact).defaultTo(true)
    table.timestamp(columnNameCompletedAt)
  })
)

const dropColumn = (knex) => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameIsIntact)
    table.dropColumn(columnNameCompletedAt)
  })
)
