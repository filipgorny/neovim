const tableName = 'student_courses'
const columnNameA = 'is_pre_reading'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.boolean(columnNameA).defaultTo(false)
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })
)
