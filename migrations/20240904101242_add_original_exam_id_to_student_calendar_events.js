const tableName = 'student_calendar_events'
const columnNameA = 'original_exam_id'

exports.up = async knex => up(knex)
exports.down = async knex => down(knex)

const up = async knex => (
  knex.schema.table(tableName, table => {
    table.uuid(columnNameA).nullable().index()

    table
      .foreign(columnNameA)
      .references('id')
      .inTable('exams')
      .onDelete('SET NULL')
  })
)

const down = async knex => (
  knex.schema.table(tableName, table => {
    table.dropColumn(columnNameA)
  })
)
