const tableName = 'student_exams'
const columnName = 'periodic_table_enabled'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnName).defaultTo(true)
  })
)

const down = knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnName)
  })
)
