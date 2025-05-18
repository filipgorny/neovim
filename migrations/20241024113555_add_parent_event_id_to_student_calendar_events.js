const tableName = 'student_calendar_events'
const columnNameA = 'parent_event_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)


const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnNameA).nullable(true)

    table
      .foreign(columnNameA)
      .references('id')
      .inTable('student_calendar_events')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })
)
