const tableName = 'student_calendar_events'
const columnNameA = 'class_time'
const columnNameB = 'class_time_end'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.string(columnNameA).nullable()
    table.string(columnNameB).nullable()
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
    table.dropColumn(columnNameB)
  })
)
